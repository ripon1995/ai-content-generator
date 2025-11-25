import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { IErrorDetail } from '../types/response_interfaces';
import { REGISTRATION_VALIDATION_MESSAGES } from '../utils/messages';
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
