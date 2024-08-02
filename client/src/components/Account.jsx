import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAccount } from "../slices/accountSlice";
import { setLikedPhotos } from "../slices/likedPhotosSlice";

function Account() {
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const likedPhotos = useSelector((state) => state.likedPhotos);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = "http://localhost:3000/api";

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        const response = await fetch(`${API_URL}/user/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          dispatch(setAccount(data));
        } else {
          if (response.status === 401 && data.error === "Token expired.") {
            alert("Session expired. Please log in again.");
            navigate("/login");
          } else {
            throw new Error("Failed to fetch account data: " + data.message);
          }
        }
      } catch (error) {
        setError(error.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [dispatch, navigate]);

  useEffect(() => {
    const fetchLikedPhotos = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        const response = await fetch(`${API_URL}/user/likedPhotos`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log("Liked photos fetched:", data);
        if (response.ok) {
          dispatch(setLikedPhotos(data));
        } else {
          if (response.status === 401 && data.error === "Token expired.") {
            alert("Session expired. Please log in again.");
            navigate("/login");
          } else {
            throw new Error("Failed to fetch liked photos: " + data.message);
          }
        }
      } catch (error) {
        setError(error.message);
        navigate("/login");
      }
    };
    fetchLikedPhotos();
  }, [dispatch, navigate]);

  const handleDeleteAccount = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/user/deleteAccount`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        sessionStorage.removeItem("token");
        navigate("/login");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete account");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="account-container">
      <div className="account">
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {account && (
          <div>
            <h2>Account Details</h2>
            <p>First Name: {account.firstName}</p>
            <p>Last Name: {account.lastName}</p>
            <p>Email: {account.email}</p>
            <button onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        )}
        <div>
          <h2>Liked Photos</h2>
          {likedPhotos.length === 0 ? (
            <p>No liked photos</p>
          ) : (
            <div className="image-grid">
              {likedPhotos.map((photo) => (
                <div key={photo.id} className="image-item">
                  <img
                    src={`http://localhost:3000${photo.url}`}
                    alt="liked"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <p>{photo.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;
