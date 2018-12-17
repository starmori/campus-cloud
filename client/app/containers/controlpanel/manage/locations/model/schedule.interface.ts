export interface ILinks {
  url: string;

  label: string;
}

export interface IItems {
  url: string;

  name: string;

  end_time: number;

  start_time: number;

  description: string;
}

export interface ISchedule {
  day: number;

  has_checked: boolean;

  items: IItems[];
}
