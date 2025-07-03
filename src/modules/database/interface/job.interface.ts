export interface Job {
  id: string;
  name: string;
  payload: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduled_at: Date;
  recurrence: string;
  created_at: Date;
  updated_at: Date;
}
