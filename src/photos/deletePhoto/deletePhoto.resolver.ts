import { Resolvers } from '../../types';
import { protectedResolver } from '../../users/users.utils';

const resolvers: Resolvers = {
  Mutation: {
    deletePhoto: protectedResolver(
      async (_, { photoId }, { client, loggedInUser }) => {
        const photo = await client.photo.findUnique({
          where: { id: photoId },
          select: { userId: true },
        });
        if (!photo) {
          return {
            ok: false,
            error: '사진이 존재하지 않습니다.',
          };
        }else if(photo.userId !== loggedInUser.id) {
            return {
                ok: false,
                error: "권한이 없습니다."
            }
        }

        await client.photo.delete({
          where: { id: photoId },
        });
        return {
          ok: true,
        };
      },
    ),
  },
};

export default resolvers;
