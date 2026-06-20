import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import heroImage from "../assets/hero.png";

function TodayMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [portionSize, setPortionSize] = useState("Normal");
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { logout } = useAuth();

  const extraOptions = [
    { name: "Egg", label: "Extra Egg", price: 50 },
    { name: "Sausages", label: "Extra Sausages", price: 50 },
    { name: "Fish", label: "Extra Fish", price: 50 },
    { name: "Chicken", label: "Extra Chicken", price: 80 },
  ];

  const getUniqueMenuItemsByType = (items) => {
  const uniqueMap = new Map();

  items.forEach((item) => {
    if (!uniqueMap.has(item.recipeType)) {
      uniqueMap.set(item.recipeType, item);
    }
  });

  return Array.from(uniqueMap.values());
};

const fetchMenu = async () => {
  try {
    const res = await API.get("/menu/today");

    const uniqueItems = getUniqueMenuItemsByType(res.data);

    setMenuItems(uniqueItems);

    if (uniqueItems.length > 0) {
      setSelectedItemId(uniqueItems[0]._id);
    }
  } catch (err) {
    setError("Failed to load today's menu");
  }
};

  useEffect(() => {
    fetchMenu();
  }, []);

  const selectedItem = menuItems.find((item) => item._id === selectedItemId);

  const getFoodDisplayName = (item) => {
    if (!item) return "";

    if (!item.recipeType || item.recipeType === "Vegetarian") {
      return item.name;
    }

    const nameAlreadyHasType = item.name
      .toLowerCase()
      .includes(item.recipeType.toLowerCase());

    if (nameAlreadyHasType) {
      return item.name;
    }

    return `${item.name} (${item.recipeType})`;
  };

  const getRecipeItems = (item) => {
    if (!item || !item.description) return [];

    return item.description
      .split(",")
      .map((recipeItem) => recipeItem.trim())
      .filter((recipeItem) => recipeItem !== "");
  };

  const handleMenuTypeSelect = (itemId) => {
    setSelectedItemId(itemId);
    setPortionSize("Normal");
    setSelectedExtras([]);
    setQuantity(1);
    setMessage("");
    setError("");
  };

  const handleExtraChange = (extraName) => {
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(selectedExtras.filter((item) => item !== extraName));
    } else {
      setSelectedExtras([...selectedExtras, extraName]);
    }
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;

    const basePrice =
      portionSize === "Normal"
        ? selectedItem.normalPrice
        : selectedItem.fullPrice;

    const extrasTotal = selectedExtras.reduce((sum, extraName) => {
      const selectedExtra = extraOptions.find(
        (extra) => extra.name === extraName
      );

      return sum + (selectedExtra ? selectedExtra.price : 0);
    }, 0);

    return (basePrice + extrasTotal) * Number(quantity || 1);
  };

  const placeOrder = async () => {
    setMessage("");
    setError("");

    if (!selectedItem) {
      setError("Please select a menu item");
      return;
    }

    try {
      const res = await API.post("/orders", {
  menuItemId: selectedItem._id,
  portionSize,
  extras: selectedExtras,
  quantity: Number(quantity),
});

      setMessage(
        `${res.data.message}. Your token is ${res.data.order.orderToken}`
      );

      setSelectedExtras([]);
      setPortionSize("Normal");

      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");

      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal</h2>

        <div>
          <Link to="/student-dashboard" className="nav-link">
            Dashboard
          </Link>

          <Link to="/my-orders" className="nav-link">
            My Orders
          </Link>

          <button className="btn secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {message && <div className="toast-message success-toast">{message}</div>}
      {error && <div className="toast-message error-toast">{error}</div>}

      <section className="dashboard">
        <h1>Today’s Dinner Menu</h1>

        <div className="deadline-box">
          <span className="deadline-icon">⏰</span>

          <div>
            <strong>Orders close at 3:00 PM</strong>
            <p>Please place your dinner order before the daily deadline.</p>
          </div>
        </div>

        {menuItems.length === 0 ? (
          <div className="empty-text">
            No menu items available for today.
          </div>
        ) : (
          <div className="student-menu-order-card">
            <div className="student-order-left">
              <h2>Select Menu Type</h2>

              <div className="student-menu-type-grid">
                {menuItems.map((item) => (
                  <button
                    type="button"
                    key={item._id}
                    className={
                      selectedItemId === item._id
                        ? "student-menu-type selected-student-menu-type"
                        : "student-menu-type"
                    }
                    onClick={() => handleMenuTypeSelect(item._id)}
                  >
                    {selectedItemId === item._id && (
                      <span className="student-selected-check">✓</span>
                    )}

                    <span>{item.recipeType}</span>
                  </button>
                ))}
              </div>

              {selectedItem && (
                <>
                  <h3 className="selected-food-title">
                    {getFoodDisplayName(selectedItem)}
                  </h3>

                  <div className="student-price-row">
                    <strong>Normal Price:</strong>
                    <span>Rs. {selectedItem.normalPrice}</span>
                  </div>

                  <div className="student-price-row">
                    <strong>Full Price:</strong>
                    <span>Rs. {selectedItem.fullPrice}</span>
                  </div>

                  <div className="portion-section">
                    <label>Portion Size</label>

                    <select
                      value={portionSize}
                      onChange={(e) => setPortionSize(e.target.value)}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>
                   
                  <div className="quantity-section">
                  <label>Quantity</label>

                  <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  />
                  </div>

                  <div className="additional-items-section">
                    <h3>Additional Items</h3>

                    {extraOptions.map((extra) => (
                      <label className="extra-item-row" key={extra.name}>
                        <input
                          type="checkbox"
                          checked={selectedExtras.includes(extra.name)}
                          onChange={() => handleExtraChange(extra.name)}
                        />

                        <span>
                          {extra.label} - Rs. {extra.price}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="student-total-box">
                    <strong>Total:</strong>
                    <span>Rs. {calculateTotal()}</span>
                  </div>

                  <button className="btn order-now-btn" onClick={placeOrder}>
                    Order Now
                  </button>
                </>
              )}
            </div>

            <div className="student-order-right">
              <div
                className="student-recipe-panel"
                style={{ "--recipe-image": `url(${heroImage})` }}
              >
                <div className="student-recipe-box">
                  <h2>Recipe Includes</h2>

                  {selectedItem ? (
                    <ul className="recipe-list">
                      {getRecipeItems(selectedItem).map((recipeItem, index) => (
                        <li key={index}>{recipeItem}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Select a menu type to view recipe details.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default TodayMenu;