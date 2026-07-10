"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import {
  useCreateProductReview,
  useProductReviews,
  useReviewEligibility,
} from "@/hooks/useReviews";
import { useCurrentUser } from "@/hooks/useAuth";

const StarRating = ({ value }: { value: number }) => {
  return (
    <div className="flex items-center gap-1 text-yellow">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon.Star key={star} size={18} weight={star <= value ? "fill" : "regular"} />
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }: { productId?: string }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState("");

  const userQuery = useCurrentUser();
  const user = userQuery.data?.data || null;
  const reviewsQuery = useProductReviews(productId);
  const eligibilityQuery = useReviewEligibility(productId, Boolean(user));
  const createReview = useCreateProductReview(productId);

  const reviews = reviewsQuery.data?.data || [];
  const eligibility = eligibilityQuery.data?.data;
  const average = reviews.length
    ? reviews.reduce((total, item) => total + Number(item.rating || 0), 0) / reviews.length
    : 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice("");

    try {
      const response = await createReview.mutateAsync({ rating, title, comment });
      setNotice(response.message || "Review submitted");
      setTitle("");
      setComment("");
      setRating(5);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Review could not be submitted");
    }
  };

  return (
    <section className="bg-white text-black md:py-16 py-10">
      <div className="container">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
          <div>
            <div className="text-button-uppercase text-secondary2">Verified reviews</div>
            <h2 className="heading4 mt-2">Customer Reviews</h2>
            <div className="flex items-center gap-4 mt-5">
              <StarRating value={Math.round(average)} />
              <span className="text-secondary">
                {reviews.length ? `${average.toFixed(1)} from ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No approved reviews yet"}
              </span>
            </div>
            <p className="body1 text-secondary mt-4 max-w-xl">
              Only logged-in customers with a delivered order for this exact product can leave a verified review.
            </p>
          </div>

          <div className="rounded-3xl border border-line p-6">
            {userQuery.isLoading ? (
              <div className="text-secondary">Checking your account...</div>
            ) : !user ? (
              <div>
                <h3 className="heading5">Login to review</h3>
                <p className="body1 text-secondary mt-2">You must be logged in and have a delivered order for this product.</p>
                <Link href="/login" className="button-main inline-block mt-5">Login</Link>
              </div>
            ) : eligibilityQuery.isLoading ? (
              <div className="text-secondary">Checking review eligibility...</div>
            ) : eligibility?.eligible ? (
              <form onSubmit={submit} className="space-y-4">
                <h3 className="heading5">Write a review</h3>
                <div>
                  <label className="caption1 text-secondary2">Rating</label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="text-yellow">
                        <Icon.Star size={25} weight={star <= rating ? "fill" : "regular"} />
                      </button>
                    ))}
                  </div>
                </div>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Review title" className="w-full rounded-xl border border-line px-4 py-3" />
                <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share your experience" rows={4} className="w-full rounded-xl border border-line px-4 py-3" />
                <button disabled={createReview.isPending} className="button-main disabled:opacity-60">
                  {createReview.isPending ? "Submitting..." : "Submit review"}
                </button>
                {notice && <p className="caption1 text-secondary">{notice}</p>}
              </form>
            ) : (
              <div>
                <h3 className="heading5">Review not available</h3>
                <p className="body1 text-secondary mt-2">
                  {eligibility?.alreadyReviewed
                    ? `Your review is ${eligibility.status}.`
                    : "Only customers with a delivered order for this product can review it."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {reviewsQuery.isLoading ? (
            <div className="text-secondary">Loading reviews...</div>
          ) : reviews.length ? (
            reviews.map((review) => (
              <article key={review._id} className="rounded-3xl border border-line p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <StarRating value={review.rating} />
                    <h3 className="heading5 mt-2">{review.title || "Verified review"}</h3>
                    <p className="caption1 text-secondary mt-1">{review.customerName || "Customer"} · Verified purchase</p>
                  </div>
                  <span className="caption1 rounded-full bg-green/20 px-3 py-1 text-black">Approved</span>
                </div>
                <p className="body1 text-secondary mt-4">{review.comment}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-line p-8 text-center text-secondary">
              No reviews are visible yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
