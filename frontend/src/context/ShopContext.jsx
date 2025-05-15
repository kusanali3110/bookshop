import React, { createContext, useEffect, useState, useContext } from 'react';
import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ShopContext = createContext(null);

const ShopProvider = ({ children }) => {
    const currency = ' VND';
    const delivery_fee = 10;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    const addToCart = (item) => {
        setCartItems([...cartItems, item]);
    };

    const getCartCount = () => {
        return cartItems.length;
    };

    const removeFromCart = (itemId) => {
        setCartItems(cartItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        setCartItems(cartItems.map(item => 
            item.id === itemId ? { ...item, quantity } : item
        ));
    };

    const getCartAmount = () => {
        return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    };

    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        removeFromCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate
    };

    useEffect(() => {
        console.log(cartItems);
    }, [cartItems]);

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};

const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};

export { ShopProvider, useShop };