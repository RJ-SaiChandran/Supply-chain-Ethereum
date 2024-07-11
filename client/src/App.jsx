import React, { useContext, useEffect, useState } from "react";
import { EthContext } from "./contexts/EthContext";
import Input from "./components/input";

function App() {
  const [cost, setCost] = useState(0);
  const [itemName, setItemName] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const { state } = useContext(EthContext);

  const [loading, setLoading] = useState({
    addItem: false,
    payItem: {},
    deliverItem: {},
  });

  function handleCost(event) {
    setCost(event.target.value);
  }

  function handleItemName(event) {
    setItemName(event.target.value);
  }

  async function handleSubmit() {
    const { contract, accounts } = state;

    try {
      setLoading({ ...loading, addItem: true });
      let result = await contract.methods
        .createItem(itemName, cost)
        .send({ from: accounts[0] });
      console.log(result);
      fetchItems(); // Update item list after adding new item
    } catch (error) {
      console.error("Error while creating item:", error);
    } finally {
      setLoading({ ...loading, addItem: false });
    }
  }

  async function fetchItems() {
    const { contract, accounts } = state;
    try {
      const itemIndex = await contract.methods.itemIndex().call();
      let items = [];
      for (let i = 0; i < itemIndex; i++) {
        const item = await contract.methods.items(i).call();
        let newItem = {
          id: i,
          itemName: item[1],
          cost: item[2],
          state: item[3].toString(), // Ensure state is converted to string
          owner: accounts[0],
        };
        items.push(newItem);
      }
      setItemsList(items);
    } catch (err) {
      console.log("Error while fetching items:", err);
    }
  }

  async function handlePayment(itemIndex) {
    const { contract, accounts } = state;

    try {
      setLoading({
        ...loading,
        payItem: { ...loading.payItem, [itemIndex]: true },
      });
      await contract.methods
        .triggerPayment(itemIndex)
        .send({ from: accounts[0], value: itemsList[itemIndex].cost });
      fetchItems();
    } catch (error) {
      console.error("Error while triggering payment:", error);
    } finally {
      setLoading({
        ...loading,
        payItem: { ...loading.payItem, [itemIndex]: false },
      });
    }
  }

  async function handleDelivery(itemIndex) {
    const { contract } = state;

    try {
      setLoading({
        ...loading,
        deliverItem: { ...loading.deliverItem, [itemIndex]: true },
      });
      await contract.methods
        .triggerDelivery(itemIndex)
        .send({ from: state.accounts[0] });
      fetchItems();
    } catch (error) {
      console.error("Error while triggering delivery:", error);
    } finally {
      setLoading({
        ...loading,
        deliverItem: { ...loading.deliverItem, [itemIndex]: false },
      });
    }
  }

  useEffect(() => {
    const delay = 2000;

    const timeoutId = setTimeout(() => {
      fetchItems();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [state]);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Supply Chain Example</h1>
      <p>
        Supply chains are the invisible threads that connect the world, weaving
        together commerce, innovation, and progress.
      </p>
      <label htmlFor="cost">Cost:</label> <br />
      <Input name="cost" value={cost} onChange={handleCost} />
      <br />
      <label htmlFor="itemname">Item Identifier:</label> <br />
      <Input name="itemName" value={itemName} onChange={handleItemName} />
      <br />
      <button type="button" onClick={handleSubmit} disabled={loading.addItem}>
        {loading.addItem ? "Adding..." : "Add Item"}
      </button>
      <div>
        <h2>Items</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {itemsList.map((item) => (
            <li key={item.id}>
              {item.itemName} - Cost: {item.cost} - Status: {item.state}
              <br />
              {item.state === "0" && (
                <>
                  {item.owner === state.accounts[0] && (
                    <button
                      type="button"
                      onClick={() => handlePayment(item.id)}
                      disabled={loading.payItem[item.id]}
                    >
                      {loading.payItem[item.id] ? "Processing..." : "Pay"}
                    </button>
                  )}
                </>
              )}
              {item.state === "1" && (
                <>
                  {item.owner === state.accounts[0] && (
                    <button
                      type="button"
                      onClick={() => handleDelivery(item.id)}
                      disabled={loading.deliverItem[item.id]}
                    >
                      {loading.deliverItem[item.id]
                        ? "Processing..."
                        : "Trigger Delivery"}
                    </button>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
