import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { POST_TYPES, getPosts } from "../redux/actions/postActions";
import { getAPI } from "../utils/fetchAPI";

import Status from "../components/Status/Status";
import Header from "../components/Header/Header";
import Alert from "../components/Alert/Alert";
import PostCard from "../components/PostCard/PostCard";
import SkeletonLoader from "../components/Loading/SkeletonLoader";
import UserSuggest from "../components/UserSuggest/UserSuggest";
import { getSuggestions } from "../redux/actions/suggestionsAction";
import Left from "../components/Sidebar/Left";
import Right from "../components/Sidebar/Right";

const HomePage = () => {
  const { auth, homePosts, suggestions } = useSelector((state) => state);
  const dispatch = useDispatch();

  const [load, setLoad] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    dispatch(getPosts(auth.token));
    dispatch(getSuggestions(auth.token));
  }, [auth.token, dispatch]);

  const handleLoadMore = useCallback(async () => {
    setLoad(true);
    const res = await getAPI(`posts?limit=${homePosts.page * 6}`, auth.token);
    if (res.data.posts.length === res.data.totalPosts) setHasMore(false);
    dispatch({
      type: POST_TYPES.GET_POSTS,
      payload: { ...res.data, page: homePosts.page + 1 },
    });
    setLoad(false);
  }, [homePosts.page, auth.token, dispatch]);

  useEffect(() => {
    const onScroll = async function () {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight &&
        hasMore
      ) {
        handleLoadMore();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleLoadMore, hasMore]);

  return (
    <div className="home-page-wrapper">
      <Header />
      <Alert />
      <div className="container-fluid">
        <div className="flex-xl-nowrap row">
          <Left></Left>
          <div className="container-content col-xl-6 col-md-9 col-12">
            <Status />
            <UserSuggest users={suggestions.users}/>
            {homePosts.posts.length !== 0 ? (
              <PostCard posts={homePosts.posts} />
            ) : (
              <div>No Post</div>
            )}
            {load && <SkeletonLoader />}
            {!hasMore && <div>Đã hiển thị hết các bài viết</div>}
          </div>
          <Right></Right>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
