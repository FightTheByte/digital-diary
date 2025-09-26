import { useEffect, useState } from "react";
import "../styles/read-page.css";
import { useNavigate } from "react-router-dom";
import writeIcon from "../assets/write.png";

export const ReadPosts = () => {
  const [binderArray, setBinderArray] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postsBackup, setPostsBackup] = useState([]);
  const [reading, setReading] = useState(false);
  const [readingBody, setReadingBody] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function authenticated() {
      const auth = await fetch("http://localhost:4000/authenticated", {
        method: "GET",
        credentials: "include",
      });
      const jsonResponse = await auth.json();

      if (jsonResponse != true) {
        navigate("/");
      }
    }

    async function getPosts() {
      const response = await fetch("http://localhost:4000/get-posts", {
        method: "GET",
        credentials: "include",
      });
      const jsonResponse = await response.json();
      setPosts(jsonResponse.response);
      setPostsBackup(jsonResponse.response);
    }

    async function populateBinder() {
      let holder = Array.from({ length: 6 }, (element, index) => {
        return <div className="binder-holes"></div>;
      });
      setBinderArray(holder);
    }
    

    authenticated();
    getPosts();
    populateBinder();
  }, []);

  async function deletePost(id, index) {
    const response = await fetch("http://localhost:4000/delete-post", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
      credentials: "include",
    });
    if (response.status == 204) {
      let temp = posts;
      temp = await temp.filter((post) => {
        return post.id != id ? true : false;
      });
      setPosts(temp);
      setPostsBackup(temp);
    }
  }

  function handleFilter(filter) {
    let new_array = [...posts];
    if (filter == "title asc") {
      new_array.sort((a, b) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
        if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
        return 0;
      });
    }
    if (filter == "title dsc") {
      new_array.sort((a, b) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) return 1;
        if (a.title.toLowerCase() > b.title.toLowerCase()) return -1;
        return 0;
      });
    }
    if (filter == "date dsc") {
      new_array.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      });
    }
    if (filter == "date asc") {
      new_array.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      });
    }
    setPosts(new_array);
  }

  function search(term) {
    term = term.toLowerCase();
    let postArray = postsBackup;
    if (term == "") {
      setPosts(postsBackup);
      return;
    }
    let searchArray = postArray.filter((post) => {
      const titleSearch = post.title.toLowerCase().includes(term);
      const tagsSearch = post.tags.some((tag) => {
        return tag.toLowerCase().includes(term);
      });

      return titleSearch || tagsSearch;
    });
    setPosts(searchArray);
  }

  function read(index){
    setReading(true);
    setReadingBody(posts[index].body);
  }

  return (
    <>
      <div className="read-background">
        <div className="read-container">
          <div className="read-book">
            <div className="read-binder">{binderArray}</div>
            {
              !reading
              ?<div className="read-page">
                <div className="post-layout">
                  <div className="search-tools">
                    <input
                      type="text"
                      placeholder="Search By Title or Tags"
                      onChange={(e) => {
                        search(e.target.value);
                      }}
                    ></input>
                    <div>
                      <label for="filter">Sort By </label>
                      <select
                        name="filter"
                        onChange={(e) => {
                          handleFilter(e.target.value);
                        }}
                      >
                        <option value="date asc">Date Ascending</option>
                        <option value="date dsc">Date Descending</option>
                        <option value="title dsc">Title Descending</option>
                        <option value="title asc">Title Ascending</option>
                      </select>
                    </div>
                    <div
                        className="account-page"
                        onClick={() => {
                          navigate('/account');
                        }}
                      >
                        <h4>Account</h4>
                    </div>
                  </div>
                  <div
                    className="read-post"
                    style={{
                      display: "grid",
                      gridTemplateRows: `repeat(${posts.length}, 1fr)`,
                    }}
                  >
                    {posts
                      ? posts.map((element, index) => {
                          return (
                            <div className="post-container-read">
                              <div 
                                className="tabs"
                                onClick={() => {
                                    read(index);
                                  }}
                              ></div>
                              <div key={element.id} className="posts">
                                <div
                                  onClick={() => {
                                    read(index);
                                  }}
                                >
                                  <h4>{element.title}</h4>
                                </div>
                                <div 
                                  onClick={() => {
                                    read(index);
                                  }}
                                >
                                  <p>{new Date(element.date).toUTCString()}</p>
                                </div>
                                <div
                                  className="delete"
                                  onClick={() => {
                                    deletePost(element.id);
                                  }}
                                >
                                  x
                                </div>
                              </div>
                            </div>
                          );
                        })
                      : null}
                  </div>
                  <div
                    className="write-icon-container"
                    onClick={() => {
                      navigate("/post");
                    }}
                  >
                    <img src={writeIcon} className="write-icon" />
                  </div>
                </div>
              </div>
              :<div
                    style={{
                      backgroundColor: "white"
                    }}
                    onClick={() => {
                      setReading(false);
                    }}
                    className="read-area"
              >
                <p
                  style={{
                    whiteSpace: "preserve"
                  }}
                >
                  {
                    readingBody
                  }
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
};
