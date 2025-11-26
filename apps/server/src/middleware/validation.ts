import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { IErrorDetail } from '../types/response_interfaces';
import { REGISTRATION_VALIDATION_MESSAGES, LOGIN_VALIDATION_MESSAGES, CONTENT_VALIDATION_MESSAGES } from '../utils/messages';
import { REGEX_PATTERN, CONSTANT_VALUES} from '../utils/constants';
import { ValidationException } from '../exceptions';

// validation middleware : registration api
export const validate = (req: Request, _: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails: IErrorDetail[] = errors.array().map((error) => ({
      field: error.type === 'field' ? (error as any).path : undefined,
      message: error.msg,
    }));

    throw new ValidationException(errorDetails);
  }

  next();

  // default return
  return;
};

// validation rules for register
export const registerValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .isEmail()
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.VALID_EMAIL)
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.PASSWORD_REQUIRED)
    .isLength({ min: CONSTANT_VALUES.PASSWORD_MIN_LENGTH })
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.VALID_PASSWORD_MIN_LENGTH)
    .matches(REGEX_PATTERN.PASSWORD)
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.PASSWORD_VALIDATION_RULE),

  body('firstName')
    .trim()
    .notEmpty()
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.FIRST_NAME_REQUIRED)
    .isLength({ min: CONSTANT_VALUES.NAME_MIN_LENGTH, max: CONSTANT_VALUES.NAME_MAX_LENGTH })
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.FIRST_NAME_VALIDATION_LENGTH)
    .matches(REGEX_PATTERN.NAME)
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.FIRST_NAME_VALIDATION_RULE),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.LAST_NAME_REQIRED)
    .isLength({ min: CONSTANT_VALUES.NAME_MIN_LENGTH, max: CONSTANT_VALUES.NAME_MAX_LENGTH })
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.LAST_NAME_VALIDATION_LENGTH)
    .matches(REGEX_PATTERN.NAME)
    .withMessage(REGISTRATION_VALIDATION_MESSAGES.LAST_NAME_VALIDATION_RULE),
];

// validation rules for login
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(LOGIN_VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .isEmail()
    .withMessage(LOGIN_VALIDATION_MESSAGES.VALID_EMAIL)
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage(LOGIN_VALIDATION_MESSAGES.PASSWORD_REQUIRED),
];

// validation rules for refresh token
export const refreshTokenValidation = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
];

// validation rules for create content
export const createContentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(CONTENT_VALIDATION_MESSAGES.TITLE_REQUIRED)
    .isLength({ max: 200 })
    .withMessage(CONTENT_VALIDATION_MESSAGES.TITLE_MAX_LENGTH),

  body('contentType')
    .notEmpty()
    .withMessage(CONTENT_VALIDATION_MESSAGES.CONTENT_TYPE_REQUIRED)
    .isIn(['blog', 'product', 'social'])
    .withMessage(CONTENT_VALIDATION_MESSAGES.CONTENT_TYPE_INVALID),

  body('prompt')
    .notEmpty()
    .withMessage(CONTENT_VALIDATION_MESSAGES.PROMPT_REQUIRED)
    .isLength({ max: 1000 })
    .withMessage(CONTENT_VALIDATION_MESSAGES.PROMPT_MAX_LENGTH),

  body('generatedText')
    .notEmpty()
    .withMessage(CONTENT_VALIDATION_MESSAGES.GENERATED_TEXT_REQUIRED),

  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage(CONTENT_VALIDATION_MESSAGES.STATUS_INVALID),
];

// validation rules for update content
export const updateContentValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(CONTENT_VALIDATION_MESSAGES.TITLE_REQUIRED)
    .isLength({ max: 200 })
    .withMessage(CONTENT_VALIDATION_MESSAGES.TITLE_MAX_LENGTH),

  body('contentType')
    .optional()
    .isIn(['blog', 'product', 'social'])
    .withMessage(CONTENT_VALIDATION_MESSAGES.CONTENT_TYPE_INVALID),

  body('prompt')
    .optional()
    .notEmpty()
    .withMessage(CONTENT_VALIDATION_MESSAGES.PROMPT_REQUIRED)
    .isLength({ max: 1000 })
    .withMessage(CONTENT_VALIDATION_MESSAGES.PROMPT_MAX_LENGTH),

  body('generatedText')
    .optional()
    .notEmpty()
    .withMessage(CONTENT_VALIDATION_MESSAGES.GENERATED_TEXT_REQUIRED),

  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage(CONTENT_VALIDATION_MESSAGES.STATUS_INVALID),
];
