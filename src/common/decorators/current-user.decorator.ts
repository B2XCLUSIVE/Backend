import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
//import { UserDocument } from '@app/common/models/user.schema';

const getCurrentUserByContext = (context: ExecutionContext):User => {
  // console.log(context.switchToHttp().getRequest().user);
  return context.switchToHttp().getRequest().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);