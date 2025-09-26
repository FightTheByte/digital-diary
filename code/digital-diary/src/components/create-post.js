import "../styles/post-page.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bookmark from "../assets/bookmark.png";

export const CreatePost = () => {
  const [binderArray, setBinderArray] = useState();
  const [body, setBody] = useState(false);
  const [title, setTitle] = useState(false);
  const [tags, setTags] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function populateBinder() {
      let holder = Array.from({ length: 6 }, (element, index) => {
        return <div className="binder-holes"></div>;
      });
      setBinderArray(holder);
    }
    populateBinder();
  }, []);

  useEffect(() => {
    async function authenticated() {
      const auth = await fetch(`${process.env.REACT_APP_SERVER_URL}/authenticated`, {
        method: "GET",
        credentials: "include",
      });
      const jsonResponse = await auth.json();

      if (jsonResponse != true) {
        navigate("/");
      }
    }
    authenticated();
  }, []);

  async function post() {
    if(!body || !title) return;
    
    let requestBody;
    if (body && title && tags) {
      requestBody = {
        title: title,
        post: body,
        tags,
        tags,
      };
    }

    if (body && title && !tags) {
      requestBody = {
        title: title,
        post: body,
      };
    }
    console.log(requestBody);
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });
   
    if (response.status == 200) {
      window.location.reload(true);
    }
  }

  return (
    <>
      <div className="post-background">
        <div className="post-container">
          <div className="post-book">
            <img
              src={bookmark}
              onClick={() => {
                navigate("/read");
              }}
            />
            <div id="post-binder">{binderArray}</div>
            <div id="post-page">
              <textarea
                maxLength={2000}
                minLength={1}
                resize="none"
                placeholder="Today I...."
                onChange={(e) => {
                  setBody(e.target.value);
                }}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="input-container">
            <input
              type="text"
              maxLength={15}
              placeholder="Title"
              className="post-input"
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            ></input>
            <input
              type="text"
              placeholder="Tags: Happy Sad Software"
              className="post-input"
              onChange={(e) => {
                let list = e.target.value;
                list = list.split(" ");
                if (list.length > 10) {
                  alert("Maximum of ten tags");
                } else {
                  setTags(list);
                }
              }}
            ></input>
            <button
                className="post-button"
                onClick={() => {
                  post();
                }}
              >
                Save
            </button>
        </div>
      </div>
    </>
  );
};
