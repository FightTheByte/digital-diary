import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/account-page.css";
import {Chart, ArcElement, Tooltip, Legend} from 'chart.js';
import {Pie} from 'react-chartjs-2';

Chart.register(ArcElement, Tooltip, Legend);

export const Account = () => {

  const [days, setDays] = useState();
  const [writtenDays, setWrittenDays] = useState();
  const [binderArray, setBinderArray] = useState([]);
  const navigate = useNavigate();

  const data = {
    labels: [
      'Journal Pages',
      'Days without page'
    ],
    datasets: [{
      label: ['Percentage of the month %'],
      data: [((writtenDays/days)*100), 100],
      backgroundColor: [
        'rgb(54, 137, 201)',
        'rgb(201, 118, 54)'
      ]
    }]
  };

  const options = {
    responsive: false,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom"
      }
    }
  }


    
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
      return jsonResponse.response;
    }

    async function populateBinder() {
      let holder = Array.from({ length: 6 }, (element, index) => {
        return <div className="binder-holes"></div>;
      });
      setBinderArray(holder);
    }

    async function populatePosts(){
      let response = await getPosts();
      let current_month = new Date().getMonth();
      let current_year = new Date().getFullYear();
      let days; 

      switch(current_month){
        case 8:
        case 3:
        case 5:
        case 10:
          days = 30;
          break;
        case 0:
        case 1:
          if(current_year % 100 === 0 ? current_year % 400 === 0 : current_year % 4 === 0){
            days = 28;
          } else {
            days = 29;
          }
          break;
        case 2:
        case 4:
        case 6:
        case 7:
        case 9:
        case 11:
          days = 31;
          break;
        
      }

      const posts_array = response.filter(post => {
        return new Date(post.date).getMonth() == current_month && new Date(post.date).getFullYear == current_year
        ? false
        : true
      });
      setDays(days);

      const days_array = posts_array.map(post => {
        return new Date(post.date).getDate();
      })
      
      let days_set = new Set(days_array);
      setWrittenDays(days_set.size);
    
    }

    authenticated();
    populatePosts();
    populateBinder();
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
          <div className="acc-book">
            <div className="account-binder">{binderArray}</div>
            <div className="acc-page">
                <navbar className='account-navbar'>
                    <div
                        onClick={() => {
                            logout()
                        }}
                        className="selector"
                    >
                        <h3>Logout</h3>
                    </div>
                    <div
                        onClick={() => {
                            navigate('/post')
                        }}
                        className="selector"
                    >
                        <h3>Journal</h3>
                    </div>
                    <div
                        onClick={() => {
                            navigate('/read');
                        }}
                        className="selector"
                    >
                        <h3>Read</h3>
                    </div>
                </navbar>
                <div
                    className="pie-chart-container"
                >       
                    <p>Percentage of the month you've made a journal entry</p>
                    <Pie 
                        className="chart" 
                        data={data} 
                        options={options} 
                        
                    />
                </div>
            </div>
          </div>
        
      </div>
    </>
  );
};
