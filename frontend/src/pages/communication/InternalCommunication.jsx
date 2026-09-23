import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import AddPeopleModal from "../../components/communication/AddPeopleModal.jsx";

import {
  createConversation,
  getConversation,
  getConversations,
  getMessages,
  markConversationRead,
  removeParticipant,
  sendMessage,
  toggleMessageReaction,
} from "../../api/internalCommunication.js";

import { getCommunicationSocket } from "../../api/communicationSocket.js";


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const dataOf = (response) => response?.data ?? response;


const nameOf = (user) =>
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  "Unknown user";


const initialsOf = (user) =>
  nameOf(user)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();


const timeOf = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";


const dateOf = (value) =>
  value
    ? new Date(value).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })
    : "";


/*
|--------------------------------------------------------------------------
| AVATAR
|--------------------------------------------------------------------------
*/

function Avatar({ user, small = false }) {
  return (
    <div
      className={`
        ${small
          ? "h-8 w-8 text-[10px]"
          : "h-10 w-10 text-xs"
        }
        grid shrink-0 place-items-center rounded-full
        bg-[var(--bms-accent)]/10
        font-bold text-[var(--bms-accent)]
      `}
    >
      {initialsOf(user)}
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| CONVERSATION TITLE
|--------------------------------------------------------------------------
*/

function ConversationTitle({
  conversation,
  currentUserId,
}) {
  if (!conversation) {
    return "Internal Communication";
  }

  if (conversation.name) {
    return conversation.name;
  }

  const others = (conversation.participants || []).filter(
    (participant) =>
      participant.userId !== currentUserId
  );

  return (
    others
      .map((participant) =>
        nameOf(participant.user)
      )
      .join(", ") || "Conversation"
  );
}


/*
|--------------------------------------------------------------------------
| INTERNAL COMMUNICATION
|--------------------------------------------------------------------------
*/

export default function InternalCommunication() {
  /*
  |--------------------------------------------------------------------------
  | CURRENT USER
  |--------------------------------------------------------------------------
  */

  const user = JSON.parse(
    localStorage.getItem("sre_user") ||
    localStorage.getItem("nts_bms_user") ||
    "null"
  );

  const currentUserId = user?.id;


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [conversations, setConversations] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  const [selected, setSelected] = useState(null);

  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [mobileChat, setMobileChat] =
    useState(false);

  const [addPeopleOpen, setAddPeopleOpen] =
    useState(false);

  const [newOpen, setNewOpen] = useState(false);

  const [newType, setNewType] =
    useState("GROUP");

  const [newName, setNewName] = useState("");


  /*
  |--------------------------------------------------------------------------
  | REFS
  |--------------------------------------------------------------------------
  */

  const socketRef = useRef(null);

  const selectedIdRef = useRef(null);

  const typingTimerRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Prevent stale conversation requests from overwriting
  | a newer conversation selection.
  |--------------------------------------------------------------------------
  */

  const conversationRequestRef = useRef(0);


  /*
  |--------------------------------------------------------------------------
  | FILTER CONVERSATIONS
  |--------------------------------------------------------------------------
  */

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return conversations;
    }

    return conversations.filter(
      (conversation) => {
        const title = ConversationTitle({
          conversation,
          currentUserId,
        }).toLowerCase();

        return (
          title.includes(term) ||
          conversation.description
            ?.toLowerCase()
            .includes(term)
        );
      }
    );
  }, [
    conversations,
    search,
    currentUserId,
  ]);


  /*
  |--------------------------------------------------------------------------
  | LOAD CONVERSATIONS
  |--------------------------------------------------------------------------
  */

  const loadConversations = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getConversations({
          page: 1,
          limit: 50,
        });

      const result = dataOf(response);

      const rows = Array.isArray(result)
        ? result
        : result?.data || [];

      setConversations(rows);

      /*
      |--------------------------------------------------------------------------
      | Select first conversation only if nothing
      | has already been selected.
      |--------------------------------------------------------------------------
      */

      if (!selectedIdRef.current && rows[0]?.id) {
        setSelectedId(rows[0].id);
      }
    } catch (err) {
      setError(
        err?.message ||
        "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | LOAD ONE CONVERSATION + MESSAGES
  |--------------------------------------------------------------------------
  */

  const loadConversation = async (id) => {
    if (!id) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Give this request a unique number.
    |
    | If the user clicks another conversation before this
    | request finishes, the old response will be ignored.
    |--------------------------------------------------------------------------
    */

    const requestId =
      ++conversationRequestRef.current;

    setMessagesLoading(true);
    setError("");

    try {
      const [
        conversationResponse,
        messagesResponse,
      ] = await Promise.all([
        getConversation(id),

        getMessages(id, {
          page: 1,
          limit: 100,
        }),
      ]);

      /*
      |--------------------------------------------------------------------------
      | Ignore stale response.
      |--------------------------------------------------------------------------
      */

      if (
        requestId !==
        conversationRequestRef.current
      ) {
        return;
      }

      const conversation =
        dataOf(conversationResponse);

      const messageResult =
        dataOf(messagesResponse);

      const loadedMessages = Array.isArray(
        messageResult
      )
        ? messageResult
        : messageResult?.data || [];

      setSelected(conversation);

      setMessages(loadedMessages);

      /*
      |--------------------------------------------------------------------------
      | Mark conversation as read.
      |--------------------------------------------------------------------------
      */

      await markConversationRead(id).catch(
        () => { }
      );
    } catch (err) {
      /*
      |--------------------------------------------------------------------------
      | Don't display an error from an old request.
      |--------------------------------------------------------------------------
      */

      if (
        requestId !==
        conversationRequestRef.current
      ) {
        return;
      }

      setSelected(null);
      setMessages([]);

      setError(
        err?.message ||
        "Unable to load the conversation."
      );
    } finally {
      if (
        requestId ===
        conversationRequestRef.current
      ) {
        setMessagesLoading(false);
      }
    }
  };


  /*
  |--------------------------------------------------------------------------
  | INITIAL CONVERSATION LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadConversations();
  }, []);


  /*
  |--------------------------------------------------------------------------
  | KEEP selectedIdRef IN SYNC
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    selectedIdRef.current =
      selectedId;
  }, [selectedId]);


  /*
  |--------------------------------------------------------------------------
  | IMPORTANT FIX
  |--------------------------------------------------------------------------
  |
  | Whenever the user clicks a conversation and selectedId changes,
  | actually load that conversation and its messages.
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      setMessages([]);
      return;
    }

    loadConversation(selectedId);
  }, [selectedId]);


  /*
  |--------------------------------------------------------------------------
  | SOCKET INITIALIZATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const socket =
      getCommunicationSocket();

    socketRef.current = socket;


    /*
    |--------------------------------------------------------------------------
    | MESSAGE CREATED / UPDATED
    |--------------------------------------------------------------------------
    */

    const appendOrUpdateMessage = (
      incoming
    ) => {
      if (
        !incoming?.id ||
        incoming.conversationId !==
        selectedIdRef.current
      ) {
        return;
      }

      setMessages((current) => {
        const index =
          current.findIndex(
            (item) =>
              item.id === incoming.id
          );

        /*
        |--------------------------------------------------------------------------
        | New message
        |--------------------------------------------------------------------------
        */

        if (index === -1) {
          return [
            ...current,
            incoming,
          ];
        }

        /*
        |--------------------------------------------------------------------------
        | Existing message update
        |--------------------------------------------------------------------------
        */

        const next = [...current];

        next[index] = {
          ...next[index],
          ...incoming,
        };

        return next;
      });
    };


    const onMessageCreated =
      appendOrUpdateMessage;


    const onMessageUpdated =
      appendOrUpdateMessage;


    /*
    |--------------------------------------------------------------------------
    | MESSAGE DELETED
    |--------------------------------------------------------------------------
    */

    const onMessageDeleted = (
      incoming
    ) => {
      if (
        !incoming?.id ||
        incoming.conversationId !==
        selectedIdRef.current
      ) {
        return;
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === incoming.id
            ? {
              ...item,
              ...incoming,
            }
            : item
        )
      );
    };


    /*
    |--------------------------------------------------------------------------
    | MESSAGE REACTION
    |--------------------------------------------------------------------------
    */

    const onReaction = ({
      messageId,
      reaction,
    }) => {
      if (
        !messageId ||
        !selectedIdRef.current
      ) {
        return;
      }

      setMessages((current) =>
        current.map((item) => {
          if (
            item.id !== messageId
          ) {
            return item;
          }

          return {
            ...item,
            reactions:
              Array.isArray(
                item.reactions
              )
                ? item.reactions
                : [],
            realtimeReaction:
              reaction,
          };
        })
      );

      /*
      |--------------------------------------------------------------------------
      | Reload the active conversation so reaction
      | counts remain authoritative.
      |--------------------------------------------------------------------------
      */

      loadConversation(
        selectedIdRef.current
      );
    };


    /*
    |--------------------------------------------------------------------------
    | CONVERSATION CREATED
    |--------------------------------------------------------------------------
    */

    const onConversationCreated = (
      conversation
    ) => {
      if (!conversation?.id) {
        return;
      }

      setConversations(
        (current) =>
          current.some(
            (item) =>
              item.id ===
              conversation.id
          )
            ? current
            : [
              conversation,
              ...current,
            ]
      );
    };


    /*
    |--------------------------------------------------------------------------
    | CONVERSATION UPDATED
    |--------------------------------------------------------------------------
    */

    const onConversationUpdated = (
      conversation
    ) => {
      if (!conversation?.id) {
        return;
      }

      setConversations(
        (current) =>
          current.map((item) =>
            item.id ===
              conversation.id
              ? conversation
              : item
          )
      );

      if (
        selectedIdRef.current ===
        conversation.id
      ) {
        setSelected(
          conversation
        );
      }
    };


    /*
    |--------------------------------------------------------------------------
    | CONVERSATION DELETED
    |--------------------------------------------------------------------------
    */

    const onConversationDeleted = ({
      conversationId,
    }) => {
      if (!conversationId) {
        return;
      }

      setConversations(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              conversationId
          )
      );

      if (
        selectedIdRef.current ===
        conversationId
      ) {
        setSelectedId(null);
        setSelected(null);
        setMessages([]);
        setMobileChat(false);
      }
    };


    /*
    |--------------------------------------------------------------------------
    | PARTICIPANTS ADDED
    |--------------------------------------------------------------------------
    */

    const onParticipantsAdded = (
      conversation
    ) => {
      if (!conversation?.id) {
        return;
      }

      setConversations(
        (current) => {
          const exists =
            current.some(
              (item) =>
                item.id ===
                conversation.id
            );

          return exists
            ? current.map(
              (item) =>
                item.id ===
                  conversation.id
                  ? conversation
                  : item
            )
            : [
              conversation,
              ...current,
            ];
        }
      );

      if (
        selectedIdRef.current ===
        conversation.id
      ) {
        setSelected(
          conversation
        );
      }
    };


    /*
    |--------------------------------------------------------------------------
    | PARTICIPANTS UPDATED
    |--------------------------------------------------------------------------
    */

    const onParticipantsUpdated = (
      conversation
    ) => {
      if (!conversation?.id) {
        return;
      }

      setConversations(
        (current) =>
          current.map((item) =>
            item.id ===
              conversation.id
              ? conversation
              : item
          )
      );

      if (
        selectedIdRef.current ===
        conversation.id
      ) {
        setSelected(
          conversation
        );
      }
    };


    /*
    |--------------------------------------------------------------------------
    | PARTICIPANT REMOVED
    |--------------------------------------------------------------------------
    */

    const onParticipantRemoved = ({
      conversationId,
    }) => {
      if (!conversationId) {
        return;
      }

      if (
        selectedIdRef.current ===
        conversationId
      ) {
        setSelectedId(null);
        setSelected(null);
        setMessages([]);
        setMobileChat(false);
      }

      setConversations(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              conversationId
          )
      );
    };


    /*
    |--------------------------------------------------------------------------
    | REGISTER SOCKET EVENTS
    |--------------------------------------------------------------------------
    */

    socket.on(
      "message:created",
      onMessageCreated
    );

    socket.on(
      "message:updated",
      onMessageUpdated
    );

    socket.on(
      "message:deleted",
      onMessageDeleted
    );

    socket.on(
      "message:reaction",
      onReaction
    );

    socket.on(
      "conversation:created",
      onConversationCreated
    );

    socket.on(
      "conversation:updated",
      onConversationUpdated
    );

    socket.on(
      "conversation:deleted",
      onConversationDeleted
    );

    socket.on(
      "participants:added",
      onParticipantsAdded
    );

    socket.on(
      "conversation:participants-updated",
      onParticipantsUpdated
    );

    socket.on(
      "participant:removed",
      onParticipantRemoved
    );


    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {
      socket.off(
        "message:created",
        onMessageCreated
      );

      socket.off(
        "message:updated",
        onMessageUpdated
      );

      socket.off(
        "message:deleted",
        onMessageDeleted
      );

      socket.off(
        "message:reaction",
        onReaction
      );

      socket.off(
        "conversation:created",
        onConversationCreated
      );

      socket.off(
        "conversation:updated",
        onConversationUpdated
      );

      socket.off(
        "conversation:deleted",
        onConversationDeleted
      );

      socket.off(
        "participants:added",
        onParticipantsAdded
      );

      socket.off(
        "conversation:participants-updated",
        onParticipantsUpdated
      );

      socket.off(
        "participant:removed",
        onParticipantRemoved
      );
    };
  }, []);


  /*
  |--------------------------------------------------------------------------
  | JOIN ACTIVE CONVERSATION SOCKET ROOM
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const socket =
      socketRef.current ||
      getCommunicationSocket();

    if (!selectedId) {
      return undefined;
    }

    /*
    |--------------------------------------------------------------------------
    | Join conversation room
    |--------------------------------------------------------------------------
    */

    socket.emit(
      "conversation:join",
      selectedId
    );

    /*
    |--------------------------------------------------------------------------
    | Presence
    |--------------------------------------------------------------------------
    */

    socket.emit(
      "conversation:presence",
      {
        conversationId: selectedId,
      }
    );


    /*
    |--------------------------------------------------------------------------
    | Cleanup previous conversation room
    |--------------------------------------------------------------------------
    */

    return () => {
      socket.emit(
        "conversation:leave",
        selectedId
      );

      if (
        typingTimerRef.current
      ) {
        window.clearTimeout(
          typingTimerRef.current
        );
      }
    };
  }, [selectedId]);


  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  const submitMessage = async (
    event
  ) => {
    event.preventDefault();

    const trimmed =
      message.trim();

    if (
      !trimmed ||
      !selectedId ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response =
        await sendMessage(
          selectedId,
          {
            body: trimmed,
          }
        );

      const created =
        dataOf(response);

      /*
      |--------------------------------------------------------------------------
      | Add immediately for the sender.
      |
      | Socket event may also arrive, but the duplicate
      | is prevented by ID.
      |--------------------------------------------------------------------------
      */

      if (created?.id) {
        setMessages(
          (current) =>
            current.some(
              (item) =>
                item.id ===
                created.id
            )
              ? current
              : [
                ...current,
                created,
              ]
        );
      }

      setMessage("");

      /*
      |--------------------------------------------------------------------------
      | Update conversation preview.
      |--------------------------------------------------------------------------
      */

      setConversations(
        (current) =>
          current.map(
            (conversation) =>
              conversation.id ===
                selectedId
                ? {
                  ...conversation,

                  messages: created
                    ? [
                      created,
                      ...(conversation.messages ||
                        []),
                    ]
                    : conversation.messages,

                  updatedAt:
                    created?.createdAt ||
                    conversation.updatedAt,
                }
                : conversation
          )
      );
    } catch (err) {
      setError(
        err?.message ||
        "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | TYPING INDICATOR
  |--------------------------------------------------------------------------
  */

  const handleMessageChange = (
    event
  ) => {
    const value =
      event.target.value;

    setMessage(value);

    const socket =
      socketRef.current;

    if (
      !socket ||
      !selectedId
    ) {
      return;
    }

    socket.emit(
      "conversation:typing",
      {
        conversationId:
          selectedId,

        isTyping:
          Boolean(value.trim()),
      }
    );

    if (
      typingTimerRef.current
    ) {
      window.clearTimeout(
        typingTimerRef.current
      );
    }

    typingTimerRef.current =
      window.setTimeout(() => {
        socket.emit(
          "conversation:typing",
          {
            conversationId:
              selectedId,

            isTyping: false,
          }
        );
      }, 900);
  };


  /*
  |--------------------------------------------------------------------------
  | CREATE NEW CONVERSATION
  |--------------------------------------------------------------------------
  */

  const createNew = async () => {
    if (
      newType !== "COMPANY" &&
      !newName.trim()
    ) {
      return;
    }

    try {
      const response =
        await createConversation({
          type: newType,

          name:
            newName.trim() ||
            "Company Conversation",

          participantIds: [],
        });

      const created =
        dataOf(response);

      setNewOpen(false);

      setNewName("");

      /*
      |--------------------------------------------------------------------------
      | Add the new conversation immediately.
      |--------------------------------------------------------------------------
      */

      if (created?.id) {
        setConversations(
          (current) => [
            created,
            ...current.filter(
              (item) =>
                item.id !==
                created.id
            ),
          ]
        );

        /*
        |--------------------------------------------------------------------------
        | THIS automatically triggers the
        | selectedId -> loadConversation effect.
        |--------------------------------------------------------------------------
        */

        setSelectedId(
          created.id
        );

        setMobileChat(true);
      } else {
        await loadConversations();
      }
    } catch (err) {
      setError(
        err?.message ||
        "Unable to create conversation."
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | PEOPLE ADDED
  |--------------------------------------------------------------------------
  */

  const onPeopleAdded = async (
    conversation
  ) => {
    const updated =
      dataOf(conversation);

    if (!updated?.id) {
      return;
    }

    setSelected(updated);

    setConversations(
      (current) =>
        current.map(
          (item) =>
            item.id ===
              updated.id
              ? updated
              : item
        )
    );

    /*
    |--------------------------------------------------------------------------
    | Refresh active conversation so all
    | participant information is authoritative.
    |--------------------------------------------------------------------------
    */

    if (
      updated.id === selectedId
    ) {
      await loadConversation(
        updated.id
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | REMOVE PARTICIPANT
  |--------------------------------------------------------------------------
  */

  const removeUser = async (
    userId
  ) => {
    if (!selectedId) {
      return;
    }

    try {
      await removeParticipant(
        selectedId,
        userId
      );

      await loadConversation(
        selectedId
      );

      await loadConversations();
    } catch (err) {
      setError(
        err?.message ||
        "Unable to remove participant."
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | REACT TO MESSAGE
  |--------------------------------------------------------------------------
  */

  const react = async (
    messageId,
    type
  ) => {
    try {
      await toggleMessageReaction(
        messageId,
        type
      );

      await loadConversation(
        selectedId
      );
    } catch (err) {
      setError(
        err?.message ||
        "Unable to update reaction."
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | SELECT CONVERSATION
  |--------------------------------------------------------------------------
  |
  | Centralized handler.
  |
  | This makes it very clear that clicking a conversation
  | selects it and opens the chat on mobile.
  |
  |--------------------------------------------------------------------------
  */

  const openConversation = (
    conversationId
  ) => {
    if (
      !conversationId
    ) {
      return;
    }

    setError("");

    setSelectedId(
      conversationId
    );

    /*
    |--------------------------------------------------------------------------
    | On mobile, switch from conversation list
    | to message view.
    |--------------------------------------------------------------------------
    */

    setMobileChat(true);
  };


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main
      className="
        min-h-[calc(100vh-1px)]
        bg-[var(--bms-bg)]
        p-3
        text-[var(--bms-text)]
        sm:p-5
        lg:p-6
      "
    >
      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}

        <div className="mb-4 flex items-center justify-between gap-3">

          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[var(--bms-accent)]
              "
            >
              Workspace
            </p>

            <h1 className="mt-1 text-xl font-black sm:text-2xl">
              Internal Communication
            </h1>

            <p
              className="
                mt-1
                hidden
                text-xs
                text-[var(--bms-text-muted)]
                sm:block
              "
            >
              Private conversations for the
              NTS BMS team.
            </p>
          </div>


          <button
            type="button"
            onClick={() =>
              setNewOpen(true)
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[var(--bms-accent)]
              px-3
              py-2
              text-sm
              font-bold
              text-white
              shadow-sm
            "
          >
            <Plus size={17} />

            <span className="hidden sm:inline">
              New conversation
            </span>
          </button>
        </div>


        {/* ERROR */}

        {error && (
          <div
            className="
              mb-3
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-red-500/20
              bg-red-500/5
              px-4
              py-3
              text-xs
              text-red-500
            "
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={15} />
            </button>
          </div>
        )}


        {/* COMMUNICATION LAYOUT */}

        <section
          className="
            grid
            min-h-[70vh]
            overflow-hidden
            rounded-2xl
            border
            border-[var(--bms-border)]
            bg-[var(--bms-surface)]
            shadow-sm
            lg:grid-cols-[330px_minmax(0,1fr)]
          "
        >

          {/* =========================================================
              CONVERSATION LIST
          ========================================================== */}

          <aside
            className={`
              ${mobileChat
                ? "hidden"
                : "flex"
              }
              min-h-[70vh]
              flex-col
              border-r
              border-[var(--bms-border)]
              lg:flex
            `}
          >

            {/* SEARCH */}

            <div
              className="
                border-b
                border-[var(--bms-border)]
                p-4
              "
            >
              <div className="relative">

                <Search
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[var(--bms-text-muted)]
                  "
                  size={16}
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search conversations..."
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface-soft)]
                    pl-9
                    pr-3
                    text-xs
                    outline-none
                    focus:border-[var(--bms-accent)]
                  "
                />
              </div>
            </div>


            {/* CONVERSATIONS */}

            <div className="flex-1 overflow-y-auto p-2">

              {loading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="
                          h-16
                          animate-pulse
                          rounded-xl
                          bg-[var(--bms-surface-soft)]
                        "
                      />
                    )
                  )}
                </div>
              ) : filtered.length ? (
                filtered.map(
                  (conversation) => {

                    const active =
                      selectedId ===
                      conversation.id;

                    const last =
                      conversation.messages?.[0];

                    const preview =
                      last?.body ||
                      conversation.description ||
                      "No messages yet";

                    const person =
                      conversation.participants?.find(
                        (participant) =>
                          participant.userId !==
                          currentUserId
                      )?.user;


                    return (
                      <button
                        key={
                          conversation.id
                        }
                        type="button"
                        onClick={() =>
                          openConversation(
                            conversation.id
                          )
                        }
                        className={`
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          p-3
                          text-left
                          transition
                          ${active
                            ? "bg-[var(--bms-accent)]/10"
                            : "hover:bg-[var(--bms-surface-soft)]"
                          }
                        `}
                      >

                        <Avatar
                          user={
                            person ||
                            conversation
                              .participants?.[0]
                              ?.user
                          }
                        />


                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-2">

                            <p className="truncate text-sm font-bold">
                              {ConversationTitle(
                                {
                                  conversation,
                                  currentUserId,
                                }
                              )}
                            </p>

                            {last?.createdAt && (
                              <span
                                className="
                                  shrink-0
                                  text-[9px]
                                  text-[var(--bms-text-muted)]
                                "
                              >
                                {dateOf(
                                  last.createdAt
                                )}
                              </span>
                            )}
                          </div>


                          <p
                            className="
                              mt-1
                              truncate
                              text-[11px]
                              text-[var(--bms-text-muted)]
                            "
                          >
                            {preview}
                          </p>

                        </div>
                      </button>
                    );
                  }
                )
              ) : (
                <div
                  className="
                    px-4
                    py-12
                    text-center
                    text-xs
                    text-[var(--bms-text-muted)]
                  "
                >
                  No conversations found.
                </div>
              )}

            </div>
          </aside>


          {/* =========================================================
              MESSAGE VIEW
          ========================================================== */}

          <section
            className={`
              ${mobileChat
                ? "flex"
                : "hidden"
              }
              min-w-0
              flex-col
              lg:flex
            `}
          >

            {!selected ? (

              /*
              |--------------------------------------------------------------------------
              | NO SELECTED CONVERSATION
              |--------------------------------------------------------------------------
              */

              <div
                className="
                  grid
                  flex-1
                  place-items-center
                  p-8
                  text-center
                "
              >
                <div>

                  <MessageCircle
                    className="
                      mx-auto
                      text-[var(--bms-accent)]
                    "
                    size={38}
                  />

                  <h2 className="mt-4 font-bold">
                    {selectedId
                      ? "Loading conversation..."
                      : "Select a conversation"}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-[var(--bms-text-muted)]
                    "
                  >
                    {selectedId
                      ? "Loading messages..."
                      : "Choose a conversation from the list to start communicating."}
                  </p>

                  {selectedId &&
                    messagesLoading && (
                      <div
                        className="
                          mx-auto
                          mt-4
                          h-5
                          w-5
                          animate-spin
                          rounded-full
                          border-2
                          border-[var(--bms-accent)]
                          border-t-transparent
                        "
                      />
                    )}

                </div>
              </div>

            ) : (

              /*
              |--------------------------------------------------------------------------
              | ACTIVE CONVERSATION
              |--------------------------------------------------------------------------
              */

              <>
                {/* CHAT HEADER */}

                <header
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-[var(--bms-border)]
                    px-4
                    py-3
                    sm:px-5
                  "
                >

                  {/* MOBILE BACK */}

                  <button
                    type="button"
                    onClick={() =>
                      setMobileChat(false)
                    }
                    className="
                      grid
                      h-9
                      w-9
                      place-items-center
                      rounded-lg
                      hover:bg-[var(--bms-surface-soft)]
                      lg:hidden
                    "
                  >
                    <ArrowLeft
                      size={18}
                    />
                  </button>


                  {/* ICON */}

                  <div
                    className="
                      grid
                      h-10
                      w-10
                      place-items-center
                      rounded-full
                      bg-[var(--bms-accent)]/10
                      text-[var(--bms-accent)]
                    "
                  >
                    <Users
                      size={18}
                    />
                  </div>


                  {/* TITLE */}

                  <div className="min-w-0 flex-1">

                    <h2
                      className="
                        truncate
                        text-sm
                        font-bold
                      "
                    >
                      {ConversationTitle(
                        {
                          conversation:
                            selected,
                          currentUserId,
                        }
                      )}
                    </h2>

                    <p
                      className="
                        text-[10px]
                        text-[var(--bms-text-muted)]
                      "
                    >
                      {selected
                        .participants
                        ?.length || 0}{" "}
                      participants
                    </p>

                  </div>


                  {/* ADD PEOPLE */}

                  {selected.type !==
                    "DIRECT" && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddPeopleOpen(
                            true
                          )
                        }
                        className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-[var(--bms-border)]
                        px-3
                        py-2
                        text-xs
                        font-bold
                        hover:bg-[var(--bms-surface-soft)]
                      "
                      >
                        <UserPlus
                          size={15}
                        />

                        <span className="hidden sm:inline">
                          Add people
                        </span>
                      </button>
                    )}

                </header>


                {/* =====================================================
                    CHAT BODY
                ====================================================== */}

                <div className="flex min-h-0 flex-1 flex-col">

                  <div
                    className="
                      flex-1
                      overflow-y-auto
                      p-4
                      sm:p-6
                    "
                  >

                    {messagesLoading ? (

                      /*
                      |--------------------------------------------------------------------------
                      | MESSAGE LOADING
                      |--------------------------------------------------------------------------
                      */

                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(
                          (item) => (
                            <div
                              key={item}
                              className="
                                h-14
                                animate-pulse
                                rounded-xl
                                bg-[var(--bms-surface-soft)]
                              "
                            />
                          )
                        )}
                      </div>

                    ) : messages.length ? (

                      /*
                      |--------------------------------------------------------------------------
                      | MESSAGES
                      |--------------------------------------------------------------------------
                      */

                      <div
                        className="
                          mx-auto
                          max-w-4xl
                          space-y-5
                        "
                      >

                        {messages.map(
                          (item) => {

                            const mine =
                              item.senderId ===
                              currentUserId;

                            return (
                              <div
                                key={
                                  item.id
                                }
                                className={`
                                  flex
                                  gap-2.5
                                  ${mine
                                    ? "justify-end"
                                    : "justify-start"
                                  }
                                `}
                              >

                                {!mine && (
                                  <Avatar
                                    user={
                                      item.sender
                                    }
                                    small
                                  />
                                )}


                                <div
                                  className={`
                                    max-w-[82%]
                                    sm:max-w-[70%]
                                    ${mine
                                      ? "items-end"
                                      : "items-start"
                                    }
                                  `}
                                >

                                  {!mine && (
                                    <p
                                      className="
                                        mb-1
                                        px-1
                                        text-[10px]
                                        font-semibold
                                        text-[var(--bms-text-muted)]
                                      "
                                    >
                                      {nameOf(
                                        item.sender
                                      )}
                                    </p>
                                  )}


                                  {/* MESSAGE BUBBLE */}

                                  <div
                                    className={`
                                      rounded-2xl
                                      px-3.5
                                      py-2.5
                                      text-sm
                                      leading-6
                                      ${mine
                                        ? "rounded-br-md bg-[var(--bms-accent)] text-white"
                                        : "rounded-bl-md bg-[var(--bms-surface-soft)]"
                                      }
                                    `}
                                  >
                                    <p
                                      className={
                                        item.status ===
                                          "DELETED"
                                          ? "italic opacity-70"
                                          : "whitespace-pre-wrap break-words"
                                      }
                                    >
                                      {item.body}
                                    </p>
                                  </div>


                                  {/* MESSAGE META */}

                                  <div
                                    className={`
                                      mt-1
                                      flex
                                      items-center
                                      gap-2
                                      px-1
                                      ${mine
                                        ? "justify-end"
                                        : "justify-start"
                                      }
                                    `}
                                  >

                                    <span
                                      className="
                                        text-[9px]
                                        text-[var(--bms-text-muted)]
                                      "
                                    >
                                      {timeOf(
                                        item.createdAt
                                      )}

                                      {item.status ===
                                        "EDITED" &&
                                        " · edited"}
                                    </span>


                                    <button
                                      type="button"
                                      onClick={() =>
                                        react(
                                          item.id,
                                          "LIKE"
                                        )
                                      }
                                      className="
                                        text-[10px]
                                        text-[var(--bms-text-muted)]
                                        hover:text-[var(--bms-accent)]
                                      "
                                    >
                                      ♡
                                    </button>

                                  </div>

                                </div>
                              </div>
                            );
                          }
                        )}

                      </div>

                    ) : (

                      /*
                      |--------------------------------------------------------------------------
                      | EMPTY CONVERSATION
                      |--------------------------------------------------------------------------
                      */

                      <div
                        className="
                          grid
                          h-full
                          place-items-center
                          text-center
                        "
                      >
                        <div>

                          <MessageCircle
                            className="
                              mx-auto
                              text-[var(--bms-text-muted)]
                            "
                            size={34}
                          />

                          <p
                            className="
                              mt-3
                              text-sm
                              font-semibold
                            "
                          >
                            No messages yet
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-[var(--bms-text-muted)]
                            "
                          >
                            Send the first message below.
                          </p>

                        </div>
                      </div>
                    )}

                  </div>


                  {/* ===================================================
                      MESSAGE COMPOSER
                  ==================================================== */}

                  <form
                    onSubmit={
                      submitMessage
                    }
                    className="
                      border-t
                      border-[var(--bms-border)]
                      bg-[var(--bms-surface)]
                      p-3
                      sm:p-4
                    "
                  >

                    <div
                      className="
                        mx-auto
                        flex
                        max-w-4xl
                        items-end
                        gap-2
                        rounded-2xl
                        border
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface-soft)]
                        p-2
                      "
                    >

                      {/* ATTACHMENT */}

                      <button
                        type="button"
                        className="
                          grid
                          h-9
                          w-9
                          shrink-0
                          place-items-center
                          rounded-lg
                          text-[var(--bms-text-muted)]
                          hover:bg-[var(--bms-surface)]
                        "
                      >
                        <Paperclip
                          size={17}
                        />
                      </button>


                      {/* MESSAGE */}

                      <textarea
                        value={message}
                        onChange={
                          handleMessageChange
                        }
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                            "Enter" &&
                            !event.shiftKey
                          ) {
                            event.preventDefault();

                            submitMessage(
                              event
                            );
                          }
                        }}
                        rows={1}
                        placeholder="Write a message..."
                        className="
                          max-h-32
                          min-h-9
                          flex-1
                          resize-none
                          bg-transparent
                          px-1
                          py-2
                          text-sm
                          outline-none
                        "
                      />


                      {/* EMOJI */}

                      <button
                        type="button"
                        className="
                          hidden
                          h-9
                          w-9
                          shrink-0
                          place-items-center
                          rounded-lg
                          text-[var(--bms-text-muted)]
                          hover:bg-[var(--bms-surface)]
                          sm:grid
                        "
                      >
                        <Smile
                          size={17}
                        />
                      </button>


                      {/* SEND */}

                      <button
                        type="submit"
                        disabled={
                          !message.trim() ||
                          sending
                        }
                        className="
                          grid
                          h-9
                          w-9
                          shrink-0
                          place-items-center
                          rounded-xl
                          bg-[var(--bms-accent)]
                          text-white
                          disabled:opacity-40
                        "
                      >
                        {sending ? (
                          <span
                            className="
                              h-4
                              w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-white
                              border-t-transparent
                            "
                          />
                        ) : (
                          <Send
                            size={16}
                          />
                        )}
                      </button>

                    </div>

                  </form>

                </div>
              </>
            )}

          </section>
        </section>
      </div>


      {/* =============================================================
          ADD PEOPLE MODAL
      ============================================================== */}

      <AddPeopleModal
        open={addPeopleOpen}
        conversationId={selectedId}
        onClose={() =>
          setAddPeopleOpen(false)
        }
        onAdded={onPeopleAdded}
      />


      {/* =============================================================
          NEW CONVERSATION MODAL
      ============================================================== */}

      <AnimatePresence>
        {newOpen && (
          <motion.div
            className="
              fixed
              inset-0
              z-[90]
              grid
              place-items-center
              bg-black/50
              p-4
              backdrop-blur-sm
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >

            <motion.div
              className="
                w-full
                max-w-md
                rounded-2xl
                border
                border-[var(--bms-border)]
                bg-[var(--bms-surface)]
                p-5
                shadow-2xl
              "
              initial={{
                scale: 0.96,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.96,
                opacity: 0,
              }}
            >

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between">

                <h2 className="font-bold">
                  New conversation
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setNewOpen(false)
                  }
                >
                  <X size={18} />
                </button>

              </div>


              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--bms-text-muted)]
                "
              >
                Create the conversation first,
                then use Add people to choose
                employees.
              </p>


              {/* FORM */}

              <div className="mt-5 space-y-3">

                {/* TYPE */}

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-[var(--bms-text-muted)]
                    "
                  >
                    Type
                  </label>

                  <select
                    value={newType}
                    onChange={(event) =>
                      setNewType(
                        event.target.value
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-xl
                      border
                      border-[var(--bms-border)]
                      bg-[var(--bms-surface-soft)]
                      px-3
                      text-sm
                      outline-none
                    "
                  >
                    <option value="GROUP">
                      Group
                    </option>

                    <option value="COMPANY">
                      Company
                    </option>
                  </select>

                </div>


                {/* NAME */}

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-[var(--bms-text-muted)]
                    "
                  >
                    Name
                  </label>

                  <input
                    value={newName}
                    onChange={(event) =>
                      setNewName(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Product Team"
                    className="
                      h-10
                      w-full
                      rounded-xl
                      border
                      border-[var(--bms-border)]
                      bg-[var(--bms-surface-soft)]
                      px-3
                      text-sm
                      outline-none
                      focus:border-[var(--bms-accent)]
                    "
                  />

                </div>

              </div>


              {/* ACTIONS */}

              <div
                className="
                  mt-6
                  flex
                  justify-end
                  gap-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setNewOpen(false)
                  }
                  className="
                    rounded-lg
                    border
                    border-[var(--bms-border)]
                    px-4
                    py-2
                    text-sm
                    font-semibold
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={createNew}
                  disabled={
                    newType !==
                    "COMPANY" &&
                    !newName.trim()
                  }
                  className="
                    rounded-lg
                    bg-[var(--bms-accent)]
                    px-4
                    py-2
                    text-sm
                    font-bold
                    text-white
                    disabled:opacity-40
                  "
                >
                  Create
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}