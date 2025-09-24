import '../styles/post-page.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CreatePost = () => {
    const [binderArray, setBinderArray] = useState(Array(6));
    const navigate = useNavigate();

    useEffect(() => {
        async function populateBinder(){
            let holder = Array.from({length: 6},(element, index) => {
                return <div
                    className='binder-holes'
                ></div>
            })
            setBinderArray(holder)
        }
        populateBinder();
    }, [])

    useEffect(() => {
        async function authenticated(){
            const auth = await fetch('http://localhost:4000/authenticated', {
                method: "GET",
                credentials: "include"
            })
            const jsonResponse = await auth.json();
            console.log(jsonResponse);
            if(jsonResponse != true){
                navigate('/');
            }
        }
        authenticated()
    }, [])

    return(
        <>
            <div className="post-background">
                <div className="post-book">
                    <div id="post-binder">
                        {
                          binderArray
                        }
                    </div>
                    <div id="post-page">
                        <textarea
                            maxLength={2000}
                            minLength={1}
                            resize="none"
                            placeholder='Today I....'
                        ></textarea>
                    </div>
                </div>
                <input type="text"></input>
                <input type="text"></input>
                <div>
                    <button>Save</button>
                </div>
            </div>
        </>
    )
}