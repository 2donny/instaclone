import styled from 'styled-components';
import Avatar from '../../components/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faComment,
  faPaperPlane,
  faBookmark,
} from '@fortawesome/free-regular-svg-icons';
import { faHeart as SolidHeart } from '@fortawesome/free-solid-svg-icons';
import { FatText } from '../../components/shared';
import { useMutation, gql, DataProxy } from '@apollo/client';
import type { PhotoTypes, MutationResponse } from '../../shared/types';

interface Props extends PhotoTypes {}

interface ToggleLikeMutationResult {
  data: {
    toggleLikePhoto: MutationResponse;
  };
}

const TOGGLE_LIKE_PHOTO_MUTATION = gql`
  mutation toggleLikePhoto($id: Int!) {
    toggleLikePhoto(id: $id) {
      ok
      error
    }
  }
`;

export default function Photo({
  id,
  user,
  file,
  caption,
  isLiked,
  likes,
  createdAt,
  commentNumber,
  comments,
}: Props) {
  const [toggleLike] = useMutation<
    ToggleLikeMutationResult['data'],
    { id: number }
  >(TOGGLE_LIKE_PHOTO_MUTATION, {
    variables: {
      id: id!,
    },
    update(cache: DataProxy, result: ToggleLikeMutationResult | any) {
      const {
        data: {
          toggleLikePhoto: { ok },
        },
      } = result;
      if (ok) {
        const fragmentId = `Photo:${id}`;
        const fragment = gql`
          fragment name on Photo {
            isLiked
            likes
          }
        `;
        cache.writeFragment({
          id: fragmentId,
          fragment: fragment,
          data: {
            isLiked: !isLiked,
            likes: isLiked ? likes! - 1 : likes! + 1,
          },
        });
      }
    },
  });

  return (
    <PhotoContainer>
      <PhotoHeader>
        <Avatar lg url={user?.avatar} />
        <Username>{user?.username}</Username>
      </PhotoHeader>
      <PhotoFile
        onClick={() => {
          toggleLike({
            variables: {
              id: id!,
            },
          });
        }}
        src={file}
      />
      <PhotoData>
        <PhotoActions>
          <div>
            <PhotoAction>
              <FontAwesomeIcon
                onClick={() => toggleLike()}
                style={{ color: isLiked ? 'tomato' : 'inherit' }}
                icon={isLiked ? SolidHeart : faHeart}
              />
            </PhotoAction>
            <PhotoAction>
              <FontAwesomeIcon icon={faComment} />
            </PhotoAction>
            <PhotoAction>
              <FontAwesomeIcon icon={faPaperPlane} />
            </PhotoAction>
          </div>
          <div>
            <FontAwesomeIcon icon={faBookmark} />
          </div>
        </PhotoActions>
        <Likes>{likes !== 0 && `좋아요 ${likes}개`}</Likes>
        <Comments>
          <Comment>
            <FatText>{user?.username}</FatText>
            <CommentCaption>{caption}</CommentCaption>
          </Comment>
          <CommentCount>
            {commentNumber !== 0 ? `댓글 ${commentNumber}개 모두 보기` : null}
          </CommentCount>
          {comments?.map((comment) => (
            <Comment key={comment.id}>
              <FatText>{comment.user?.username}</FatText>
              <CommentCaption>{comment.payload}</CommentCaption>
              {comment.payload}
            </Comment>
          ))}
        </Comments>
      </PhotoData>
    </PhotoContainer>
  );
}

const CommentCount = styled.span`
  color: #8e8e8e;
  margin-bottom: 4px;
  display: block;
  font-size: 14px;
  cursor: pointer;
`;

const Comments = styled.div`
  margin-top: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;
const Comment = styled.div`
    margin: 8px 0;
`;
const CommentCaption = styled.span`
  margin-left: 5px;
`;

const PhotoContainer = styled.div`
  background-color: #fff;
  border-radius: 3px;
  border: 1px solid ${(props) => props.theme.borderColor};
  max-width: 615px;
  margin: 20px auto 60px;
`;
const PhotoHeader = styled.div`
  padding: 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(239, 239, 239);
`;

const Username = styled(FatText)`
  margin-left: 15px;
`;
const PhotoFile = styled.img`
  max-width: 100%;
  min-width: 100%;
  object-fit: cover;
  cursor: pointer;
`;

const PhotoData = styled.div`
  padding: 12px 15px;
`;

const PhotoActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  div {
    display: flex;
    align-items: center;
  }
  svg {
    font-size: 20px;
  }
`;

const PhotoAction = styled.div`
  margin-right: 10px;
  cursor: pointer;
`;

const Likes = styled(FatText)`
  margin-top: 15px;
  display: block;
`;
