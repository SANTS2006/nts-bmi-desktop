import { cloneElement, isValidElement, useState } from "react";
import PermissionDeniedModal from "./PermissionDeniedModal";
import { useAuth } from "../../context/AuthContext";

export default function PermissionGate({
  permission,
  anyOf,
  allOf,
  roles,
  action = "perform this action",
  children,
  className = "",
}) {
  const { canAccess } = useAuth();
  const [open, setOpen] = useState(false);
  const allowed = canAccess({ permission, anyOf, allOf, roles });

  const handleDenied = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setOpen(true);
  };

  const child = isValidElement(children)
    ? cloneElement(children, {
        onClick: (...args) => {
          const event = args[0];
          if (!allowed) {
            handleDenied(event);
            return;
          }
          children.props?.onClick?.(...args);
        },
      })
    : (
        <span
          role="button"
          tabIndex={0}
          onClick={allowed ? undefined : handleDenied}
          onKeyDown={(event) => {
            if (!allowed && (event.key === "Enter" || event.key === " ")) {
              handleDenied(event);
            }
          }}
          className={className}
        >
          {children}
        </span>
      );

  return (
    <>
      {child}
      <PermissionDeniedModal
        open={open}
        onClose={() => setOpen(false)}
        permission={permission || anyOf?.join(" or ") || allOf?.join(" + ")}
        action={action}
      />
    </>
  );
}
