import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function ManageMenu() {
  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Colombo",
    });
  };

  const menuTypes = [
    { label: "Chicken", value: "Chicken", icon: "🍗" },
    { label: "Fish", value: "Fish", icon: "🐟" },
    { label: "Egg", value: "Egg", icon: "🥚" },
    { label: "Sausages", value: "Sausages", icon: "🌭" },
    { label: "Vegetarian", value: "Vegetarian", icon: "🥬" },
  ];

  const initialPrices = {
    Chicken: { normal: 180, full: 230, extra: 80 },
    Fish: { normal: 150, full: 200, extra: 50 },
    Egg: { normal: 150, full: 200, extra: 50 },
    Sausages: { normal: 150, full: 200, extra: 50 },
    Vegetarian: { normal: 100, full: 150, extra: "" },
  };

  const [menuItems, setMenuItems] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [curries, setCurries] = useState(["", "", "", ""]);
  const [prices, setPrices] = useState(initialPrices);
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [date, setDate] = useState(getTodayDate());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { logout } = useAuth();

  const showMessage = (text) => {
    setMessage(text);
    setError("");

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const showError = (text) => {
    setError(text);
    setMessage("");

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  const fetchMenuItems = async () => {
    try {
      const res = await API.get("/menu");
      setMenuItems(res.data);
    } catch (err) {
      showError("Failed to load menu items");
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const toggleMenuType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((item) => item !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleCurryChange = (index, value) => {
    const updatedCurries = [...curries];
    updatedCurries[index] = value;
    setCurries(updatedCurries);
  };

  const addCurryInput = () => {
    setCurries([...curries, ""]);
  };

  const handlePriceChange = (type, field, value) => {
    setPrices({
      ...prices,
      [type]: {
        ...prices[type],
        [field]: value,
      },
    });
  };

  const cleanText = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  };

  const makeRecipeKey = (item) => {
    return [
      cleanText(item.name),
      cleanText(item.recipeType),
      cleanText(item.description),
      Number(item.normalPrice),
      Number(item.fullPrice),
    ].join("|");
  };

  const getSelectedCurries = () => {
    return curries.map((curry) => curry.trim()).filter((curry) => curry !== "");
  };

  const buildDescription = (type) => {
    const selectedCurries = getSelectedCurries();

    if (type === "Vegetarian") {
      return ["Rice", ...selectedCurries].join(", ");
    }

    return ["Rice", type, ...selectedCurries].join(", ");
  };

  const handleSaveTodayMenu = async () => {
    setMessage("");
    setError("");

    if (selectedTypes.length === 0) {
      showError("Please select at least one available menu type.");
      return;
    }

    if (getSelectedCurries().length === 0) {
      showError("Please enter today's curries.");
      return;
    }

    const todayMenuItems = selectedTypes.map((type) => ({
      name: "Rice & Curry",
      recipeType: type,
      description: buildDescription(type),
      normalPrice: Number(prices[type].normal),
      fullPrice: Number(prices[type].full),
      date,
      isAvailable: true,
    }));

    const newItemsOnly = todayMenuItems.filter((newItem) => {
      return !menuItems.some((existingItem) => {
        return (
          existingItem.date === date &&
          makeRecipeKey(existingItem) === makeRecipeKey(newItem)
        );
      });
    });

    if (newItemsOnly.length === 0) {
      showError("These same menu items are already saved for this date.");
      return;
    }

    try {
      await Promise.all(newItemsOnly.map((item) => API.post("/menu", item)));

      showMessage("Today's menu saved successfully");
      fetchMenuItems();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save today's menu");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal Admin</h2>

        <div>
          <Link to="/admin-dashboard" className="nav-link">
            Dashboard
          </Link>

          <Link to="/manage-orders" className="nav-link">
            Orders
          </Link>

          <Link to="/analytics" className="nav-link">
            Analytics
          </Link>

          <button className="btn secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {message && <div className="toast-message success-toast">{message}</div>}
      {error && <div className="toast-message error-toast">{error}</div>}

      <section className="dashboard">
        <h1>Manage Menu</h1>
        <p>Set today's available menu types, curries, and prices.</p>

        <div className="simple-menu-page">
          <div className="available-types-card">
            <h2>Available Menu Types</h2>
            <p>Select the menu types available today.</p>

            <div className="menu-type-grid">
              {menuTypes.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  className={
                    selectedTypes.includes(type.value)
                      ? "menu-type-card selected-menu-type"
                      : "menu-type-card"
                  }
                  onClick={() => toggleMenuType(type.value)}
                >
                  {selectedTypes.includes(type.value) && (
                    <span className="selected-check">✓</span>
                  )}

                  <span className="menu-type-icon">{type.icon}</span>
                  <span className="menu-type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="menu-content-grid">
            <div className="todays-curries-card">
              <h2>Today's Curries</h2>

              <p className="auto-rice-note">
                Rice is added automatically. Admin only needs to enter today's curries.
              </p>

              <div className="curries-list">
                {curries.map((curry, index) => (
                  <div className="curry-input-row" key={index}>
                    <span className="curry-number">{index + 1}</span>

                    <input
                      type="text"
                      value={curry}
                      placeholder={
                        index === 0
                          ? "Dhal curry"
                          : index === 1
                          ? "Carrot curry"
                          : index === 2
                          ? "Beetroot curry"
                          : index === 3
                          ? "Sambol"
                          : "Add another curry"
                      }
                      onChange={(e) => handleCurryChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add-curry-btn"
                onClick={addCurryInput}
              >
                + Add more curry
              </button>
            </div>

            <div className="price-settings-card">
              <div className="price-card-header">
                <div>
                  <h2>Price Settings</h2>
                  <p>Current prices used when saving today's menu.</p>
                </div>

                {!isEditingPrices ? (
                  <button
                    type="button"
                    className="edit-price-btn"
                    onClick={() => setIsEditingPrices(true)}
                  >
                    Edit Prices
                  </button>
                ) : (
                  <button
                    type="button"
                    className="edit-price-btn"
                    onClick={() => {
                      setIsEditingPrices(false);
                      showMessage("Price changes updated in this page");
                    }}
                  >
                    Save Prices
                  </button>
                )}
              </div>

              <div className="price-table-wrapper">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Menu Type</th>
                      <th>Normal</th>
                      <th>Full</th>
                      <th>Extra Piece</th>
                    </tr>
                  </thead>

                  <tbody>
                    {menuTypes.map((type) => (
                      <tr key={type.value}>
                        <td>
                          <span className="price-type-icon">{type.icon}</span>
                          {type.label}
                        </td>

                        <td>
                          {isEditingPrices ? (
                            <input
                              type="number"
                              value={prices[type.value].normal}
                              onChange={(e) =>
                                handlePriceChange(
                                  type.value,
                                  "normal",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <>Rs. {prices[type.value].normal}</>
                          )}
                        </td>

                        <td>
                          {isEditingPrices ? (
                            <input
                              type="number"
                              value={prices[type.value].full}
                              onChange={(e) =>
                                handlePriceChange(
                                  type.value,
                                  "full",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <>Rs. {prices[type.value].full}</>
                          )}
                        </td>

                        <td>
                          {isEditingPrices ? (
                            <input
                              type="number"
                              value={prices[type.value].extra}
                              disabled={type.value === "Vegetarian"}
                              onChange={(e) =>
                                handlePriceChange(
                                  type.value,
                                  "extra",
                                  e.target.value
                                )
                              }
                            />
                          ) : prices[type.value].extra ? (
                            <>Rs. {prices[type.value].extra}</>
                          ) : (
                            <>-</>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="price-note">
                Note: Normal and full prices are saved with today's menu. Extra piece prices are shown here for planning.
              </p>
            </div>
          </div>

          <div className="save-today-menu-card">

            <div className="save-actions">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <button
                type="button"
                className="save-today-btn"
                onClick={handleSaveTodayMenu}
              >
                Save Today's Menu
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ManageMenu;