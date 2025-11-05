export default {
  //Success
  GET_PAGINATE_SUCCESS: 'Get paginate users success',
  GET_BY_ID_SUCCESS: 'Get user by id success',
  UPDATE_ROLES_SUCCESS: 'Update user roles success',
  BAN_SUCCESS: 'Ban user success',
  UNBAN_SUCCESS: 'Unban user success',
  UPDATE_SUCCESS: 'Update user success',
  ADD_FCM_SUCCESS: 'Add new fcm token success',
  REGISTER_SUCCESS: 'Register success',
  VERIFY_EMAIL_SUCCESS: 'Verify email success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  REMOVE_FCM_SUCCESS: 'Remove fcm token success',

  //Error
  NOT_FOUND: 'User not found',
  SOMETHING_NOT_FOUND: 'Some roles not found',
  OLD_PASSWORD_INCORRECT: 'Old password is incorrect',
  USER_ROLE_MUST_HAVE_AT_LEAST_ONE: 'User must have at least one role',
  FILE_NOT_FOUND: 'File not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
} as const
