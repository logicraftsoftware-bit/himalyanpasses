const API_CONFIG = {
    // BASE_URL: "https://glacier-treks-adventures-admin-back.vercel.app",
    BASE_URL: "https://himalayanpassesbackend.logicraftsoftware.com",

    ENDPOINTS: {
        FAQS: "/api/faqs",
        SETTINGS: "/api/settings",
        STORIES: "/api/customer-stories",
        SLIDERS: "/api/sliders",
        CERTIFICATES: "/api/certificates",
        ABOUT: "/api/about-us",
        TERMS: "/api/policies",
        BLOGS: "/api/blogs",
        SIGNUP: "/api/auth/signup",
        LOGIN: "/api/auth/login",
        ENQUIRIES: "/api/enquiries",
    },

    getUrl: function (endpoint) {
        return this.BASE_URL + endpoint;
    }
};