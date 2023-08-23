import { UserGender } from '../enums/UserGender';
import { Exclude } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import * as dayjs from 'dayjs';

export class User {
  constructor(data?: CreateUserDto) {
    if (data) {
      this.email = data.email;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.otherNames = data.otherNames;
      this.dateOfBirth = dayjs(data.dateOfBirth).toDate();
      this.gender = UserGender[data.gender];
    }
  }
  @Exclude()
  public id: number;
  public firstName: string;
  public lastName: string;
  public otherNames: string;
  public email: string;
  public dateOfBirth: Date;
  public gender: UserGender;
  public uuid: string;
}
