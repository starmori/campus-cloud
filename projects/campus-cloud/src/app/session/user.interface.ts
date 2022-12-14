/**
 * @deprecated
 * shared/models.user
 * */
export interface IUser {
  account_activated: boolean;
  account_level_privileges: any;
  description: string;
  email: string;
  exec_user_id: number;
  firstname: string;
  id: number;
  is_current_user: boolean;
  lastname: string;
  position: string;
  profile_pic_url: string;
  account_mapping: any;
  attendee_type: number;
  school_level_privileges: any;
  client_level_privileges: any;
}
