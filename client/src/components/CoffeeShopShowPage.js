import React, { useState, useEffect } from "react";
import NewReviewForm from "./NewReviewForm";
import ErrorList from "./layout/ErrorList";
import translateServerErrors from "../services/translateServerErrors.js";
import ReviewTile from "./ReviewTile";

const CoffeeShopShowPage = (props) => {
  const [coffeeShop, setCoffeeShop] = useState({ reviews: [] });
  const [errors, setErrors] = useState({});
  const { id } = props.match.params;

  const handleDelete = (reviewId) => {
    const updatedReviews = coffeeShop.reviews.filter((review) => review.id !== reviewId)
    setCoffeeShop({
      ...coffeeShop,
      reviews: updatedReviews
    })
  }

  const getCoffeeShop = async () => {
    try {
      const response = await fetch(`/api/v1/coffee-shops/${id}`);
      if (!response.ok) {
        throw new Error(`${response.status} (${response.statusText})`);
      }
      const body = await response.json();
      setCoffeeShop(body.coffeeShop);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCoffeeShop();
  }, []);

  const postReview = async (reviewFormData) => {
    try {
      const response = await fetch(`/api/v1/coffee-shops/${id}/reviews`, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(reviewFormData),
      });
      if (!response.ok) {
        if (response.status === 422) {
          const body = await response.json();
          const newErrors = translateServerErrors(body.errors);
          return setErrors(newErrors);
        } else {
          const errorMessage = `${response.status} (${response.statusText})`;
          const error = new Error(errorMessage);
          throw error;
        }
      } else {
        const { review } = await response.json();
        review.voteData = {
          userHasUpvoted: false, 
          userHasDownvoted: false,
          userVoteRecordExists: false, 
          sum: 0 
        }
        review.canBeDeleted = true
        const updatedReviews = coffeeShop.reviews.concat(review);
        setErrors([]);
        setCoffeeShop({ ...coffeeShop, reviews: updatedReviews });
      }
    } catch (error) {
      console.error(`Error in fetch: ${error.message}`);
    }
  };

  const reviewTiles = coffeeShop.reviews.map((review) => {
    return <ReviewTile key={review.id} {...review} voteData={review.voteData} handleDelete={handleDelete} />
  })

  const wifiDisplay = coffeeShop.wifi ? "Wifi Available" : "No Wifi";
  const parkingDisplay = coffeeShop.parking ? "Parking Available" : "No Parking";

  return (
    <div className="show-page-container list">
      <h1>{coffeeShop.name}</h1>
      <p>{coffeeShop.address}</p>
      <p>
        {coffeeShop.city} {coffeeShop.zip}
      </p>
      <p>{coffeeShop.hours}</p>
      <p>{wifiDisplay}</p>
      <p>{parkingDisplay}</p>
      {reviewTiles}
      <ErrorList errors={errors} />
      <NewReviewForm postReview={postReview} />
    </div>
  );
};

export default CoffeeShopShowPage;
