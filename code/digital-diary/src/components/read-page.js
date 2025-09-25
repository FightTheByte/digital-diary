import { useEffect, useState } from "react";
import "../styles/read-page.css";
import { useNavigate } from "react-router-dom";
import writeIcon from '../assets/write.png';

export const ReadPosts = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("")
  const navigate = useNavigate();


  useEffect(() => {
    async function authenticated(){
            const auth = await fetch('http://localhost:4000/authenticated', {
                method: "GET",
                credentials: "include"
            })
            const jsonResponse = await auth.json();

            if(jsonResponse != true){
                navigate('/');
            }
        }
        

    async function getPosts() {
      const response = await fetch("http://localhost:4000/get-posts", {
        method: "GET",
        credentials: "include",
      });
      const jsonResponse = await response.json();
      setPosts(jsonResponse.response);
    }

    authenticated();
    getPosts();
  }, []);

  async function deletePost(id, index){
      const response = await fetch("http://localhost:4000/delete-post", {
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        }),
        credentials: 'include'
      })
      if(response.status == 204){
        let temp = posts;
        temp = await temp.filter((post) => {
            return post.id != id
            ?true
            :false
        })
        setPosts(temp);
      }
  }

  function handleFilter(filter){
    setFilter(filter)
    let new_array = [];
    if(filter == "title asc"){
      new_array = posts.sort((a, b) =>{
        if(a.title < b.title) return -1;
        if(a.title > b.title) return 1;
        return 0;
      })
    }
    if(filter == "title dsc"){
      new_array = posts.sort((a, b) =>{
        if(a.title < b.title) return 1;
        if(a.title > b.title) return -1;
        return 0;
      })
    }
    if(filter == "date dsc"){
      new_array = posts.sort((a, b) =>{
        if(a.date < b.date) return 1;
        if(a.date > b.date) return -1;
        return 0;
      })
    }  
    if(filter == "date asc"){
      new_array = posts.sort((a, b) =>{
        if(a.date < b.date) return -1;
        if(a.date > b.date) return 1;
        return 0;
      })
    }
    if(new_array.length > 0)setPosts(new_array);
  }

  return (
    <>
      <div className="read-background">
        <div className="read-container">
          <div className="read-book">
            <div className="read-binder"></div>
                <div className="read-page">
                    <div className="post-layout">
                        <div className="search-tools">
                            <input 
                                type='text'
                                placeholder="Search By Title or Tags"
                            ></input>
                            <div>
                                <label for="filter">Sort By </label>
                                <select 
                                  name="filter"
                                  onChange={(e) => {
                                    handleFilter(e.target.value)
                                  }}
                                >
                                    <option value="date asc">Date Ascending</option>
                                    <option value="date dsc">Date Descending</option>
                                    <option value="title dsc">Title Descending</option>
                                    <option value="title asc">Title Ascending</option>
                                </select>
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
                                  <div className="post-container">
                                    <div className="tabs"></div>
                                    <div key={element.id} className="posts">
                                      <h4>{element.title}</h4>
                                      <p>{new Date(element.date).toUTCString()}</p>
                                      <div 
                                        className="delete"
                                        onClick={() => {
                                            deletePost(element.id);
                                        }}
                                    >x</div>
                                    </div>
                                  </div>
                                );
                              })
                            : null}
                        </div>
                        <div 
                            className="write-icon-container"
                            onClick={() => {
                                navigate('/post')
                            }}
                        >
                            <img 
                                src={writeIcon}
                                className="write-icon"
                            />
                            
                        </div>
                    </div>
                </div>
          </div>
        </div>
      </div>
    </>
  );
};
