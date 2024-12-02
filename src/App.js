import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [formType, setFormType] = useState("");

  const [userInfoData, setUserInfoData] = useState([]);
  const [addressData, setAddressData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);

  const [editIndex, setEditIndex] = useState(null);
  const [editingFormType, setEditingFormType] = useState("");

  const apiResponses = {
    "User Information": {
      fields: [
        { name: "FirstName", type: "text", label: "First Name", required: true },
        { name: "LastName", type: "text", label: "Last Name", required: true },
        { name: "Age", type: "number", label: "Age", required: true },
      ],
    },
    "Address Information": {
      fields: [
        { name: "Street", type: "text", label: "Street", required: true },
        { name: "City", type: "text", label: "City", required: true },
        {
          name: "state",
          type: "dropdown",
          label: "State",
          options: ["California", "Texas", "New York"],
          required: true,
        },
        { name: "ZipCode", type: "text", label: "Zip Code", required: true },
      ],
    },
    "Payment Information": {
      fields: [
        { name: "CardNumber", type: "text", label: "Card Number", required: true },
        { name: "ExpiryDate", type: "date", label: "Expiry Date", required: true },
        { name: "CVV", type: "text", label: "CVV", required: true },
        { name: "CardholderName", type: "text", label: "Cardholder Name", required: true },
      ],
    },
  };

  const handleFormTypeChange = (e) => {
    const selectedForm = e.target.value;
    setFormType(selectedForm);
    setFormFields(apiResponses[selectedForm]?.fields || []);
    setFormData({});
    setProgress(0);
    setMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    const requiredFieldsFilled = formFields.filter((field) => field.required).length;
    const filledFields = Object.keys({ ...formData, [name]: value }).filter(
      (key) => formFields.some((field) => field.name === key && field.required && formData[key]?.trim())
    ).length;

    setProgress(Math.min(((filledFields + 1) / requiredFieldsFilled) * 100, 100));
  };

  const validateForm = () => {
    for (const field of formFields) {
      const value = formData[field.name];
      if (field.required && (!value || value.trim() === "")) {
        setMessage(`Please fill the ${field.label}.`);
        return false;
      }
      if (field.name === "Age" && value < 0) {
        setMessage("Age cannot be negative.");
        return false;
      }
      if (field.name === "CVV" && !/^\d{3}$/.test(value)) {
        setMessage("CVV must be exactly 3 digits.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editIndex !== null) {
      const updateHandler = (setData) =>
        setData((prev) =>
          prev.map((item, index) => (index === editIndex ? { ...formData } : item))
        );

      if (editingFormType === "User Information") updateHandler(setUserInfoData);
      else if (editingFormType === "Address Information") updateHandler(setAddressData);
      else if (editingFormType === "Payment Information") updateHandler(setPaymentData);

      setMessage("Changes saved successfully.");
    } else {
      const addHandler = (setData) => setData((prev) => [...prev, { ...formData }]);
      if (formType === "User Information") addHandler(setUserInfoData);
      else if (formType === "Address Information") addHandler(setAddressData);
      else if (formType === "Payment Information") addHandler(setPaymentData);

      setMessage("Form submitted successfully!");
    }

    setFormData({});
    setProgress(0);
    setEditIndex(null);
    setEditingFormType("");
  };

  const handleDelete = (index, formType) => {
    const deleteHandler = (setData) => setData((prev) => prev.filter((_, i) => i !== index));

    if (formType === "User Information") deleteHandler(setUserInfoData);
    else if (formType === "Address Information") deleteHandler(setAddressData);
    else if (formType === "Payment Information") deleteHandler(setPaymentData);

    setMessage("Entry deleted successfully.");
  };

  const handleEdit = (index, formType, data) => {
    setFormData({ ...data });
    setEditIndex(index);
    setEditingFormType(formType);
    setFormFields(apiResponses[formType]?.fields || []);
    setFormType(formType);
  };

  return (
    <div className="App">
      <header className="header">Dynamic Form</header>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="dropdown-container">
          <label htmlFor="formType">Select Form Type:</label>
          <select id="formType" onChange={handleFormTypeChange} value={formType}>
            <option value="">-- Select --</option>
            {Object.keys(apiResponses).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        {formFields.map((field, index) => (
          <div key={index} className="form-field">
            <label htmlFor={field.name}>
              {field.label} {field.required && "*"}
            </label>
            {field.type === "dropdown" ? (
              <select
                id={field.name}
                name={field.name}
                onChange={handleInputChange}
                value={formData[field.name] || ""}
                required={field.required}
              >
                <option value="">-- Select --</option>
                {field.options.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                onChange={handleInputChange}
                value={formData[field.name] || ""}
                required={field.required}
              />
            )}
          </div>
        ))}

        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <button type="submit" disabled={!formType}>
          {editIndex !== null ? "Save Changes" : `Submit ${formType}`}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <DataTable
        data={userInfoData}
        title="User Information"
        formType="User Information"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <DataTable
        data={addressData}
        title="Address Information"
        formType="Address Information"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <DataTable
        data={paymentData}
        title="Payment Information"
        formType="Payment Information"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <footer className="footer">Dynamic Form Implementation</footer>
    </div>
  );
};

const DataTable = ({ data, title, formType, onEdit, onDelete }) => {
  return data.length > 0 ? (
    <div className="table-container">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i}>{value}</td>
              ))}
              <td>
                <button onClick={() => onEdit(index, formType, row)}>Edit</button>
                <button onClick={() => onDelete(index, formType)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;
};

export default App;
