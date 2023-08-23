import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserGender } from './enums/UserGender';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InvalidClassException } from '@nestjs/core/errors/exceptions';
import { UpdateUserDto } from './dto/update-user.dto';

const validateFunction = (func, params) => {
  expect(func).toBeCalled();
  expect(func).toBeCalledTimes(params.calledTimes);
  if (!params.calledWith) {
    expect(func).toBeCalledWith();
  } else {
    expect(func).toBeCalledWith(params.calledWith);
  }
};

describe('UsersService', () => {
  let service: UsersService;
  const dummyUsers = [
    {
      email: 'user1@test.com',
      firstName: 'User 1',
      lastName: 'Test',
      otherNames: 'One',
      dateOfBirth: new Date('2011-10-05T14:48:00.000Z'),
      gender: UserGender['MALE'],
      uuid: '8248c277-dd8e-42bc-97d5-fa10bc5e5642',
    },
    {
      email: 'user2@test.com',
      firstName: 'User 2',
      lastName: 'Test',
      otherNames: 'Two',
      dateOfBirth: new Date('2011-10-05T14:48:00.000Z'),
      gender: UserGender['FEMALE'],
      uuid: 'd96f1582-9814-4c62-9182-c172bdc6dbca',
    },
    {
      email: 'user3@test.com',
      firstName: 'User 3',
      lastName: 'Test',
      otherNames: 'Three',
      dateOfBirth: new Date('2011-10-05T14:48:00.000Z'),
      gender: UserGender['OTHERS'],
      uuid: '6c556502-a559-4bce-ac2d-e2940af5464e',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    Object.defineProperty(service, 'persistedUsers', {
      value: [...dummyUsers],
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findAll');
    });

    it('should return an empty array of users', async () => {
      Object.defineProperty(service, 'persistedUsers', { value: [] });

      const users = await service.findAll();

      validateFunction(service.findAll, {
        calledTimes: 1,
      });

      expect(users).toEqual([]);
      expect(users.length).toEqual(0);
    });

    it('should return an array of users', async () => {
      const users = await service.findAll();
      validateFunction(service.findAll, {
        calledTimes: 1,
      });

      expect(users).toEqual(dummyUsers);
      expect(users.length).toEqual(3);
    });
  });

  describe('findOne', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findOne');
    });

    it('should throw an error if user is not present', (done) => {
      const userId = '8248c277-dd8e-42bc-97d5-fa10bc5e56t2';
      service
        .findOne(userId)
        .then(
          (user) => {
            validateFunction(service.findOne, {
              calledTimes: 1,
              calledWith: userId,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual(
              new NotFoundException(`No user exists with the ID: ${userId}`),
            );
          },
        )
        .finally(() => done());
    });

    it('should return the user if exists', async () => {
      const userId = '8248c277-dd8e-42bc-97d5-fa10bc5e5642';
      const user = await service.findOne(userId);

      validateFunction(service.findOne, {
        calledTimes: 1,
        calledWith: userId,
      });

      expect(user).toBeDefined();
      expect(user.email).toEqual(dummyUsers[0].email);
    });
  });

  describe('create', () => {
    const payload = new CreateUserDto();
    beforeEach(() => {
      payload.email = 'user4@test.com';
      payload.firstName = 'User 4';
      payload.lastName = 'Test';
      payload.otherNames = 'Four';
      payload.dateOfBirth = new Date('2011-10-05T14:48:00.000Z');
      payload.gender = UserGender.MALE;

      jest.spyOn(service, 'create');
    });

    it('should throw an error if user email already exists', (done) => {
      payload.email = 'user1@test.com';
      service
        .create(payload)
        .then(
          (user) => {
            validateFunction(service.create, {
              calledTimes: 1,
              calledWith: payload,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual(
              new NotAcceptableException(
                'A User Already Exists with the specified email',
              ),
            );
          },
        )
        .finally(() => done());
    });

    it('should throw an error if validation fails', (done) => {
      delete payload.email;
      service
        .create(payload)
        .then(
          (user) => {
            validateFunction(service.create, {
              calledTimes: 1,
              calledWith: payload,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual(
              new InvalidClassException('Invalid User Parameters Provided'),
            );
          },
        )
        .finally(() => done());
    });

    it('should create and return the user', async () => {
      const user = await service.create(payload);

      validateFunction(service.create, {
        calledTimes: 1,
        calledWith: payload,
      });

      expect(user).toBeDefined();
      expect(user.email).toEqual(payload.email);
      expect(user.id).toBeDefined();
      expect(user.uuid).toBeDefined();

      jest.spyOn(service, 'findAll');
      const newUsers = await service.findAll();

      validateFunction(service.findAll, {
        calledTimes: 1,
      });

      expect(newUsers.length).toEqual(4);
      expect(newUsers[3].email).toEqual(payload.email);
      expect(newUsers.length).toEqual(4);
    });
  });

  describe('update', () => {
    const userId = '8248c277-dd8e-42bc-97d5-fa10bc5e56t2';
    const payload = new UpdateUserDto();
    beforeEach(() => {
      payload.firstName = 'User 1';
      payload.lastName = 'Updated Test';
      payload.otherNames = undefined;
      payload.email = 'updated-email@test.com';

      jest.spyOn(service, 'update');
    });

    it('should throw an error if user is not present', (done) => {
      service
        .update(userId, payload)
        .then(
          (user) => {
            validateFunction(service.update, {
              calledTimes: 1,
              calledWith: { userId, data: payload },
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual(new NotFoundException('User does not exist'));
          },
        )
        .finally(() => done());
    });

    it('should throw an error if validation fails', (done) => {
      payload.email = 'not-a-valid-email';
      service
        .update(userId, payload)
        .then(
          (user) => {
            validateFunction(service.update, {
              calledTimes: 1,
              calledWith: payload,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual(
              new InvalidClassException('Invalid User Parameters Provided'),
            );
          },
        )
        .finally(() => done());
    });

    it('should update and return the updated user', async () => {
      const user = await service.update(
        '8248c277-dd8e-42bc-97d5-fa10bc5e5642',
        payload,
      );

      expect(user).toBeDefined();
      expect(user.email).toEqual(dummyUsers[0].email);

      jest.spyOn(service, 'findAll');
      const allUsers = await service.findAll();

      validateFunction(service.findAll, {
        calledTimes: 1,
      });

      expect(allUsers[0].email).toEqual(user.email);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      jest.spyOn(service, 'remove');
    });

    it('should throw an error if user is not present', (done) => {
      const userId = '8248c277-dd8e-42bc-97d5-fa10bc5e56t2';
      service
        .remove(userId)
        .then(
          (user) => {
            validateFunction(service.remove, {
              calledTimes: 1,
              calledWith: userId,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual(new NotFoundException('User does not exist'));
          },
        )
        .finally(() => done());
    });

    it('should delete the user and return the deleted user', async () => {
      Object.defineProperty(service, 'persistedUsers', { value: dummyUsers });
      const userId = '8248c277-dd8e-42bc-97d5-fa10bc5e5642';
      jest.spyOn(service, 'findAll');
      const user = await service.remove(userId);

      validateFunction(service.remove, {
        calledTimes: 1,
        calledWith: userId,
      });

      expect(user).toBeDefined();
      expect(user.uuid).toEqual(userId);

      const users = await service.findAll();

      validateFunction(service.findAll, {
        calledTimes: 1,
      });

      expect(users.length).toEqual(2);
    });
  });
});
