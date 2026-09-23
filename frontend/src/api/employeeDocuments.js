import {
  apiRequest,
} from "./client.js";


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function requireId(
  value,
  message = "ID is required."
) {

  if (!value) {

    throw new Error(
      message
    );
  }
}


/*
 * =========================================================
 * RESPONSE NORMALIZATION
 * =========================================================
 *
 * Kept here for consistency and easier future changes.
 */

function normalizeId(
  value,
  message
) {

  requireId(
    value,
    message
  );

  return encodeURIComponent(
    value
  );
}


/*
 * =========================================================
 * GET EMPLOYEE DOCUMENTS
 * =========================================================
 *
 * GET /api/employee-documents
 *
 * Optional:
 *
 * employeeId
 * type
 */

export const getEmployeeDocuments = ({
  employeeId = "",
  type = "",
} = {}) => {

  const query =
    new URLSearchParams();


  if (
    employeeId
  ) {

    query.set(
      "employeeId",
      employeeId
    );
  }


  if (
    type
  ) {

    query.set(
      "type",
      type
    );
  }


  const queryString =
    query.toString();


  return apiRequest(
    `/api/employee-documents${queryString
      ? `?${queryString}`
      : ""
    }`,
    {
      method:
        "GET",
    }
  );
};


/*
 * =========================================================
 * GET SINGLE EMPLOYEE DOCUMENT
 * =========================================================
 *
 * GET /api/employee-documents/:id
 */

export const getEmployeeDocumentById = (
  documentId
) => {

  const encodedId =
    normalizeId(
      documentId,
      "Document ID is required."
    );


  return apiRequest(
    `/api/employee-documents/${encodedId}`,
    {
      method:
        "GET",
    }
  );
};


/*
 * =========================================================
 * CREATE EMPLOYEE DOCUMENT
 * =========================================================
 *
 * BACKEND:
 *
 * POST /api/employee-documents/employees/:employeeId
 *
 * IMPORTANT:
 *
 * This request contains a FILE, therefore we use
 * FormData rather than JSON.
 */

export const createEmployeeDocument = (
  employeeId,
  data = {}
) => {

  const encodedEmployeeId =
    normalizeId(
      employeeId,
      "Employee ID is required."
    );


  const formData =
    new FormData();


  /*
   * Text fields.
   */

  if (
    typeof data.name === "string" &&
    data.name.trim()
  ) {

    formData.append(
      "name",
      data.name.trim()
    );
  }


  if (
    typeof data.description === "string" &&
    data.description.trim()
  ) {

    formData.append(
      "description",
      data.description.trim()
    );
  }


  formData.append(
    "type",
    data.type || "OTHER"
  );


  /*
   * File.
   */

  if (
    data.file
  ) {

    formData.append(
      "file",
      data.file
    );

  } else {

    throw new Error(
      "Please select a document file."
    );
  }


  return apiRequest(
    `/api/employee-documents/employees/${encodedEmployeeId}`,
    {
      method:
        "POST",

      body:
        formData,
    }
  );
};


/*
 * =========================================================
 * UPDATE EMPLOYEE DOCUMENT
 * =========================================================
 *
 * PATCH /api/employee-documents/:id
 *
 * File is optional.
 */

export const updateEmployeeDocument = (
  documentId,
  data = {}
) => {

  const encodedDocumentId =
    normalizeId(
      documentId,
      "Document ID is required."
    );


  const formData =
    new FormData();


  /*
   * Text fields.
   */

  if (
    typeof data.name === "string"
  ) {

    formData.append(
      "name",
      data.name.trim()
    );
  }


  if (
    typeof data.description === "string"
  ) {

    formData.append(
      "description",
      data.description.trim()
    );
  }


  formData.append(
    "type",
    data.type || "OTHER"
  );


  /*
   * Optional replacement file.
   */

  if (
    data.file
  ) {

    formData.append(
      "file",
      data.file
    );
  }


  return apiRequest(
    `/api/employee-documents/${encodedDocumentId}`,
    {
      method:
        "PATCH",

      body:
        formData,
    }
  );
};


/*
 * =========================================================
 * DELETE EMPLOYEE DOCUMENT
 * =========================================================
 *
 * DELETE /api/employee-documents/:id
 */

export const deleteEmployeeDocument = (
  documentId
) => {

  const encodedDocumentId =
    normalizeId(
      documentId,
      "Document ID is required."
    );


  return apiRequest(
    `/api/employee-documents/${encodedDocumentId}`,
    {
      method:
        "DELETE",
    }
  );
};


/*
 * =========================================================
 * GET SECURE DOWNLOAD URL
 * =========================================================
 *
 * GET /api/employee-documents/:id/download
 *
 * The backend authenticates and authorizes the user,
 * then generates the temporary Cloudinary URL.
 */

export const getEmployeeDocumentDownloadUrl = (
  documentId
) => {

  const encodedDocumentId =
    normalizeId(
      documentId,
      "Document ID is required."
    );


  return apiRequest(
    `/api/employee-documents/${encodedDocumentId}/download`,
    {
      method:
        "GET",
    }
  );
};