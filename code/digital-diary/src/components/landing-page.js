import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/landing-page.css';

export const Landing = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        async function authenticated(){
            const auth = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/authenticated`, {
                method: "GET",
                credentials: "include"
            })
            const jsonResponse = await auth.json();
            console.log(jsonResponse);
            if(jsonResponse == true){
                navigate('/post');
            }
        }
        authenticated()
    }, [])

    async function login(){
        if(username == "" || password == "") return;
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/login`, {
            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.trim(),
                password: password
            }),
            credentials: "include"
        });
        if(response.status == 200){
            navigate('/post');
        }
        if(response.status == 401){
            alert("incorrect details");
        }
        
    }

    async function register(){
        if(username == "" || password == "") return;
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/register`, {
            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
            credentials: "include"
        });
        if(response.status == 200){
            navigate('/post');
        }
        if(response.status == 400){
            alert("username already exists");
        }
    }

    return(
        <>
            <div className="background">
                <div className="book">
                    <div id="binder">
                    </div>
                    <div id="page">
                        <div id="user-details">
                            <div id="tag">
                                    <input 
                                        type="text"
                                        id="landing-fields"
                                        placeholder="Username..."
                                        maxLength={60}
                                        onChange={(e) => {
                                            setUsername(e.target.value)
                                        }}
                                        onKeyDown={(e) => {
                                            if(e.key == "Enter") login();
                                        }}
                                    ></input>                       
                                    <input 
                                        type="password"
                                        id="landing-fields"
                                        placeholder="Password..."
                                        maxLength={255}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                        }}
                                        onKeyDown={(e) => {
                                            if(e.key == "Enter") login();
                                        }}
                                    ></input>

                            </div>
                        </div>
                        <div id="landing-buttons">
                            <button 
                                className="landing-button"
                                onClick={() => {
                                    login();
                                }}
                            >Login</button>
                            <button 
                                className="landing-button"
                                onClick={() => {
                                    register();
                                }}
                            >Register</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}