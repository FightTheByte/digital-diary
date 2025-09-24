import { useEffect, useState } from "react";
import '../styles/read-page.css'

export const ReadPosts = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function getPosts(){
            const response = await fetch('http://localhost:4000/get-posts', {
                method: 'GET',
                credentials: 'include'
            })
            const jsonResponse = await response.json();
            setPosts(jsonResponse.response);
        }
        getPosts();
    }, [])

    return(
        <>
            <div 
                className="read-post"
                style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${posts.length}, 1fr)`
                }}
            >
                {
                    posts
                    ?posts.map((element, index) => {
                        return <div 
                            key={element.id}
                            className="posts"
                        >
                            <h4>{element.title}</h4>
                            <p>{new Date(element.date).toUTCString()}</p>
                            <div className="delete">x</div>
                        </div>
                    })
                    :null
                }
            </div>
        </>
    )
}