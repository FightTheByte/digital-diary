import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/account-page.css";

export const Account = () => {
  const [username, setUsername] = useState("");
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
    authenticated();
  }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
        credentials:'include'
    });
    navigate('/');
  }

  return (
    <>
      <div className="account-container">
        <div className="read-container">
          <div className="read-book">
            <div className="read-binder"></div>
            <div className="read-page">
                <div
                    onClick={() => {
                        logout()
                    }}
                >
                    <h3>Logout</h3>
                </div>
                <div
                    onClick={() => {
                        navigate('/post')
                    }}
                >
                    <h3>Journal</h3>
                </div>
                <div
                    onClick={() => {
                        navigate('/read')
                    }}
                >
                    <h3>Read</h3>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
