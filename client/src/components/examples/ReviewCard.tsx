import ReviewCard from '../ReviewCard';

export default function ReviewCardExample() {
  return (
    <div className="p-4 max-w-sm">
      <ReviewCard
        name="Susan R."
        city="Newton, MA"
        rating={5}
        text="Private InHome CareGiver matched us with a caring PCA quickly. Mom is happier and safer at home — thank you!"
        image="https://api.dicebear.com/7.x/initials/svg?seed=SR"
      />
    </div>
  );
}
