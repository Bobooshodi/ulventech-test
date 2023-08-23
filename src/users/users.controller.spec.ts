import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserGender } from './enums/UserGender';
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

describe('UsersController', () => {
  let controller: UsersController;
  let service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
    });

    it('should throw an error if service returns error', (done) => {
      jest.spyOn(service, 'create').mockRejectedValue('Some Error');
      jest.spyOn(controller, 'create');
      controller
        .create(payload)
        .then(
          (user) => {
            validateFunction(service.create, {
              calledTimes: 1,
              calledWith: payload,
            });

            validateFunction(controller.create, {
              calledTimes: 1,
              calledWith: payload,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual('Some Error');
          },
        )
        .finally(() => done());
    });

    it('should create and return the user', async () => {
      jest.spyOn(service, 'create');
      jest.spyOn(controller, 'create');
      const user = await controller.create(payload);

      validateFunction(service.create, {
        calledTimes: 1,
        calledWith: payload,
      });

      validateFunction(controller.create, {
        calledTimes: 1,
        calledWith: payload,
      });

      expect(user).toBeDefined();
      expect(user.email).toEqual(payload.email);
      expect(user.id).toBeDefined();
      expect(user.uuid).toBeDefined();
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

    it('should throw an error if service throws error', (done) => {
      jest.spyOn(service, 'update').mockRejectedValue('Some Error');
      jest.spyOn(controller, 'update');
      service
        .update(userId, payload)
        .then(
          (user) => {
            validateFunction(service.update, {
              calledTimes: 1,
              calledWith: { userId, data: payload },
            });

            validateFunction(controller.update, {
              calledTimes: 1,
              calledWith: { userId, data: payload },
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual('Some Error');
          },
        )
        .finally(() => done());
    });

    it('should update and return the updated user', async () => {
      jest.spyOn(service, 'update').mockResolvedValue({
        email: 'updated-email@test.com',
        lastName: 'Updated Test',
      });
      jest.spyOn(controller, 'update');
      const user = await controller.update(
        '8248c277-dd8e-42bc-97d5-fa10bc5e5642',
        payload,
      );

      expect(user).toBeDefined();
      expect(user.lastName).toEqual('Updated Test');
    });
  });

  describe('delete', () => {
    const userId = '8248c277-dd8e-42bc-97d5-fa10bc5e56t2';

    it('should throw an error if service throws error', (done) => {
      jest.spyOn(service, 'remove').mockRejectedValue('Some Error');
      jest.spyOn(controller, 'remove');
      service
        .remove(userId)
        .then(
          (user) => {
            validateFunction(service.remove, {
              calledTimes: 1,
              calledWith: userId,
            });

            validateFunction(controller.remove, {
              calledTimes: 1,
              calledWith: userId,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual('Some Error');
          },
        )
        .finally(() => done());
    });

    it('should delete and return the deleted user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({
        email: 'updated-email@test.com',
        lastName: 'Updated Test',
      });
      jest.spyOn(controller, 'remove');
      const user = await controller.remove(
        '8248c277-dd8e-42bc-97d5-fa10bc5e5642',
      );

      expect(user).toBeDefined();
      expect(user.lastName).toEqual('Updated Test');
    });
  });

  describe('findOne', () => {
    const userId = '8248c277-dd8e-42bc-97d5-fa10bc5e56t2';
    it('should throw an error if service throws error', (done) => {
      jest.spyOn(service, 'findOne').mockRejectedValue('Some Error');
      jest.spyOn(controller, 'findOne');
      controller
        .findOne(userId)
        .then(
          (user) => {
            validateFunction(service.findOne, {
              calledTimes: 1,
              calledWith: userId,
            });

            validateFunction(controller.findOne, {
              calledTimes: 1,
              calledWith: userId,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual('Some Error');
          },
        )
        .finally(() => done());
    });

    it('should return the user with the specified ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        email: 'updated-email@test.com',
        lastName: 'Updated Test',
        uuid: userId
      });
      jest.spyOn(controller, 'findOne');
      const user = await controller.findOne(userId);

      validateFunction(service.findOne, {
        calledTimes: 1,
        calledWith: userId,
      });

      validateFunction(controller.findOne, {
        calledTimes: 1,
        calledWith: userId,
      });

      expect(user).toBeDefined();
      expect(user.email).toEqual('updated-email@test.com');
      expect(user.uuid).toBeDefined();
      expect(user.uuid).toEqual(userId);
    });
  });

  describe('findAll', () => {
    it('should throw an error if service throws error', (done) => {
      jest.spyOn(service, 'findAll').mockRejectedValue('Some Error');
      jest.spyOn(controller, 'findAll');
      controller
        .findAll()
        .then(
          (user) => {
            validateFunction(service.findOne, {
              calledTimes: 1,
            });

            validateFunction(controller.findOne, {
              calledTimes: 1,
            });

            expect(user).toBeUndefined();
          },
          (error) => {
            expect(error).toBeDefined();
            expect(error).toEqual('Some Error');
          },
        )
        .finally(() => done());
    });

    it('should return all users', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([
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
      ]);
      jest.spyOn(controller, 'findAll');
      const users = await controller.findAll();

      validateFunction(service.findAll, {
        calledTimes: 1,
      });

      validateFunction(controller.findAll, {
        calledTimes: 1,
      });

      expect(users).toBeDefined();
      expect(users.length).toEqual(3);
    });
  });
});
