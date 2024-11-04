import { Mission } from '../models/mission.model';

export interface IMissionRepository {
  findById(id: string): Promise<Mission>;
  save(mission: Mission): Promise<Mission>;
}