import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { UserGender } from './enums/UserGender';
import { validate } from 'class-validator';
import { InvalidClassException } from '@nestjs/core/errors/exceptions';

@Injectable()
export class UsersService {
  private readonly persistedUsers: User[] = [];

  private findUserIndex(userId: string) {
    const userIndex = this.persistedUsers.findIndex(
      ({ uuid }) => userId === uuid,
    );

    if (userIndex < 0) {
      throw new NotFoundException('User does not exist');
    }

    return userIndex;
  }

  async create(data: CreateUserDto): Promise<User> {
    const validationErrors = await validate(data);

    if (!!validationErrors && validationErrors.length) {
      throw new InvalidClassException('Invalid User Parameters Provided');
    }
    const userIndex = this.persistedUsers.findIndex(
      ({ email }) => email === data.email,
    );

    if (userIndex >= 0) {
      throw new NotAcceptableException(
        'A User Already Exists with the specified email',
      );
    }

    const user = new User(data);
    user.id = this.persistedUsers.length + 1;
    user.uuid = uuidv4();
    this.persistedUsers.push(user);

    return user;
  }

  async findAll(): Promise<User[]> {
    return new Promise<User[]>((resolve) => resolve(this.persistedUsers));
  }

  async findOne(userId: string): Promise<User> {
    const user = this.persistedUsers.find(({ uuid }) => uuid === userId);

    if (!user) {
      throw new NotFoundException(`No user exists with the ID: ${userId}`);
    }

    return user;
  }

  async update(userId: string, data: UpdateUserDto): Promise<User> {
    const validationErrors = await validate(data);

    if (!!validationErrors && validationErrors.length) {
      throw new InvalidClassException('Invalid User Parameters Provided');
    }
    const userIndex = this.findUserIndex(userId);
    const user = this.persistedUsers[userIndex];
    const {
      email: updatedEmail,
      firstName: updatedFirstName,
      lastName: updatedLastName,
      otherNames: updatedOthernames,
      gender: updatedGender,
      dateOfBirth: updatedDateOfBirth,
    } = data;
    const { dateOfBirth, email, firstName, gender, lastName, otherNames } =
      user;

    user.dateOfBirth = updatedDateOfBirth || dateOfBirth;
    user.email = updatedEmail || email;
    user.firstName = updatedFirstName || firstName;
    user.gender = UserGender[updatedGender] || gender;
    user.lastName = updatedLastName || lastName;
    user.otherNames = updatedOthernames || otherNames;

    this.persistedUsers[userIndex] = user;

    return new Promise<User>((resolve) => resolve(user));
  }

  async remove(userId: string) {
    const userIndex = this.findUserIndex(userId);

    const deletedUser = this.persistedUsers.splice(userIndex, 1);
    return deletedUser[0];
  }
}
