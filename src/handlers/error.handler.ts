import {
  DEFAULT_MONGOOSE_ERROR,
  MONGO_SERVER_ERROR_CODE_MAP,
  MONGOOSE_ERROR_MAP,
  // TMongooseError,
} from "@/utils/mongoose.util";
import { HTTP_STATUS_CODES } from "../utils/http-status-codes";
import { AppError, ErrorResponse } from "../types/error.type";
import mongoose from "mongoose";
import { ZodError } from "zod";
export const appError = (error: AppError, response: ErrorResponse) => {
  response.code = error.statusCode;
  response.message = error.message;
  response.details = error.details;
};

export const zodError = (error: ZodError, response: ErrorResponse) => {
  response.code = HTTP_STATUS_CODES.BAD_REQUEST;

  const formattedErrors = error.issues.map((err) => {
    const field = err.path[1];

    return {
      field,
      message:
        err.path.length === 0
          ? "Request body cannot be empty"
          : err.code === "invalid_type" && err.expected === "undefined"
            ? `${String(field)} is required`
            : err.message,
      code: err.code,
    };
  });

  const errorMessage = formattedErrors.map((err) => err.message).join(", ");

  response.message = `${errorMessage}!`;
  response.details = { errors: formattedErrors };

  if (process.env.NODE_ENV === "development") {
    response.details.debug = error;
  }
};

// export const zodError = (error: ZodError, response: ErrorResponse) => {
//   response.code = HTTP_STATUS_CODES.BAD_REQUEST;

//   const formattedErrors = error.errors.map((err) => {
//     console.log(err.path[1]);
//     return {
//       field: err.path[1],
//       message:
//         err.path.length === 0
//           ? "Request body cannot be empty"
//           : err.code === "invalid_type" && err.received === "undefined"
//             ? `${err.path[1]} is required`
//             : err.message,
//       code: err.code,
//     };
//   });

//   // Create a combined message from all validation errors
//   const errorMessage = formattedErrors.map((err) => err.message).join(", ");

//   response.message = `${errorMessage}!`;
//   response.details = {
//     errors: formattedErrors,
//   };

//   if (process.env.NODE_ENV === "development") {
//     response.details.debug = error;
//   }
// };
export const generalError = (error: Error, response: ErrorResponse) => {
  response.message = error.message;
  response.details =
    process.env.NODE_ENV === "development" ? { stack: error.stack } : undefined;
};

export function mongooseError(
  error: mongoose.Error | mongoose.mongo.MongoServerError,
  response: ErrorResponse,
) {
  if (
    "code" in error &&
    typeof error.code === "number" &&
    error.code in MONGO_SERVER_ERROR_CODE_MAP
  ) {
    // console.log("error: ", error.code);
    const { code, message } = MONGO_SERVER_ERROR_CODE_MAP[error.code];
    response.code = code;
    response.message = message;
  } else {
    // 2) Name‐based lookup (CastError, ValidationError…)
    const errorType = error.name as keyof typeof MONGOOSE_ERROR_MAP;
    const { code, message } =
      MONGOOSE_ERROR_MAP[errorType] || DEFAULT_MONGOOSE_ERROR;
    response.code = code;
    response.message = message;
  }

  // 3) Add dev‐only details
  // console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    response.details = {
      name: error.name,
      reason: error.message,
      ...(error instanceof mongoose.Error.ValidationError && {
        validationErrors: Object.entries(error.errors).map(([field, err]) => ({
          field,
          message: err.message,
        })),
      }),
    };
  }
}

export const errorHandler = {
  appError,
  zodError,
  generalError,
  mongooseError,
};
