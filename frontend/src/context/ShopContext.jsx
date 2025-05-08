import { createContext, useEffect, useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = ' VND';
    const delivery_fee = 10;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const navigate = useNavigate();


    
    const addToCart = async (itemId,quantity) => {
       
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] += quantity;
        }
        else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            totalCount += cartItems[items];
        }
        return totalCount;
    }
    const updateQuantity = async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);

        cartData[itemId] = quantity;
        setCartItems(cartData);
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);   
            for (const item in cartItems) {
                try {
                    if (cartItems[items] > 0) {
                        totalAmount += itemInfo.price * cartItems[items];
                    }
                } catch (Error) {
                    
                }
        }
        return totalAmount ;
    }
}
    const value = {
        products , currency , delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart,
        getCartCount, updateQuantity,
        getCartAmount, navigate
    }
    useEffect(() => {
        console.log(cartItems);
        
    },[cartItems])
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider