import CartButton from "./cart-button";
import UserButton from "./user-button";

export default function Menu() {
  return (
    <div className="flex items-center gap-6">
      <UserButton />
      <CartButton />
    </div>
  );
}
