"use client"

import React from "react"

const { useState, useEffect, useRef } = React

// Import ReactDOM
const ReactDOM = window.ReactDOM

// Application state - using in-memory storage instead of localStorage
const appState = {
  currentUser: null,
  users: [
    {
      id: 1,
      email: "dealer@example.com",
      password: "password123",
      role: "property_dealer",
      name: "John Dealer",
      phone: "+1-555-0123",
    },
    {
      id: 2,
      email: "customer@example.com",
      password: "password123",
      role: "customer",
      name: "Jane Customer",
      phone: "+1-555-0124",
    },
  ],
  properties: [
    {
      id: 1,
      address: "123 Commonwealth Ave, Back Bay",
      neighborhood: "Back Bay",
      price: 850000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1500,
      propertyType: "Condo",
      listingType: "sale",
      dealerId: 1,
      status: "available",
      features: {
        CRIM: 0.02731,
        ZN: 0.0,
        INDUS: 7.07,
        CHAS: 0,
        NOX: 0.469,
        RM: 6.421,
        AGE: 78.9,
        DIS: 4.9671,
        RAD: 2,
        TAX: 242,
        PTRATIO: 17.8,
        B: 396.9,
        LSTAT: 9.14,
      },
    },
    {
      id: 2,
      address: "456 Beacon St, Beacon Hill",
      neighborhood: "Beacon Hill",
      price: 1200000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2200,
      propertyType: "Townhouse",
      listingType: "sale",
      dealerId: 1,
      status: "available",
      features: {
        CRIM: 0.02729,
        ZN: 0.0,
        INDUS: 7.07,
        CHAS: 0,
        NOX: 0.469,
        RM: 7.185,
        AGE: 61.1,
        DIS: 4.9671,
        RAD: 2,
        TAX: 242,
        PTRATIO: 17.8,
        B: 392.83,
        LSTAT: 4.03,
      },
    },
  ],
  favorites: [],
  transactions: [],
  predictions: [],
  neighborhoods: [
    { name: "Allston", lat: 42.3584, lng: -71.137, properties: 45 },
    { name: "Back Bay", lat: 42.3505, lng: -71.0763, properties: 78 },
    { name: "Beacon Hill", lat: 42.3588, lng: -71.0707, properties: 23 },
    { name: "Brighton", lat: 42.348, lng: -71.1656, properties: 67 },
    { name: "Charlestown", lat: 42.3779, lng: -71.061, properties: 34 },
    { name: "Chinatown", lat: 42.3511, lng: -71.0624, properties: 12 },
    { name: "Dorchester", lat: 42.3025, lng: -71.0736, properties: 156 },
    { name: "Downtown", lat: 42.3589, lng: -71.0571, properties: 89 },
    { name: "East Boston", lat: 42.3706, lng: -71.037, properties: 78 },
    { name: "Fenway", lat: 42.3467, lng: -71.0972, properties: 45 },
    { name: "Hyde Park", lat: 42.2553, lng: -71.1256, properties: 67 },
    { name: "Jamaica Plain", lat: 42.3097, lng: -71.1061, properties: 89 },
    { name: "North End", lat: 42.3647, lng: -71.0542, properties: 34 },
    { name: "Roxbury", lat: 42.3143, lng: -71.094, properties: 123 },
    { name: "South Boston", lat: 42.3341, lng: -71.0486, properties: 98 },
    { name: "South End", lat: 42.3396, lng: -71.0703, properties: 87 },
    { name: "West End", lat: 42.3648, lng: -71.0674, properties: 23 },
    { name: "West Roxbury", lat: 42.2795, lng: -71.1597, properties: 56 },
  ],
}

// Boston housing features with descriptions
const HOUSING_FEATURES = {
  CRIM: "Per capita crime rate by town",
  ZN: "Proportion of residential land zoned for lots over 25,000 sq.ft.",
  INDUS: "Proportion of non-retail business acres per town",
  CHAS: "Charles River dummy variable (1 if tract bounds river; 0 otherwise)",
  NOX: "Nitric oxides concentration (parts per 10 million)",
  RM: "Average number of rooms per dwelling",
  AGE: "Proportion of owner-occupied units built prior to 1940",
  DIS: "Weighted distances to five Boston employment centres",
  RAD: "Index of accessibility to radial highways",
  TAX: "Full-value property-tax rate per $10,000",
  PTRATIO: "Pupil-teacher ratio by town",
  B: "1000(Bk - 0.63)^2 where Bk is the proportion of Black people by town",
  LSTAT: "% lower status of the population",
}

// Utility functions
const isAuthenticated = () => appState.currentUser !== null
const getCurrentUser = () => appState.currentUser
const setCurrentUser = (user) => {
  appState.currentUser = user
}

function ThemeToggle() {
  const [theme, setTheme] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme")
      if (saved === "light" || saved === "dark") {
        document.documentElement.setAttribute("data-color-scheme", saved)
        setTheme(saved)
      } else {
        // If no saved theme, respect system by clearing explicit attribute
        document.documentElement.removeAttribute("data-color-scheme")
        setTheme(null)
      }
    } catch {}
  }, [])

  const toggle = () => {
    const current = document.documentElement.getAttribute("data-color-scheme")
    const next = current === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-color-scheme", next)
    setTheme(next)
    try {
      localStorage.setItem("theme", next)
    } catch {}
  }

  const icon = theme === "dark" ? "fa-sun" : "fa-moon"
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode"

  return (
    <button className="btn btn--outline btn--sm" onClick={toggle} aria-label={label} title={label}>
      <i className={`fas ${icon}`}></i>
    </button>
  )
}

// Navigation component
function Navigation({ currentPage, setCurrentPage, showMobileMenu, setShowMobileMenu }) {
  const user = getCurrentUser()

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage("home")
  }

  const navItems = [
    { id: "home", label: "Home", public: true },
    { id: "dashboard", label: "Dashboard", protected: true },
    { id: "properties", label: "Properties", protected: true },
    { id: "predictions", label: "Predictions", protected: true },
    { id: "map", label: "Map View", protected: true },
    { id: "profile", label: "Profile", protected: true },
  ]

  const visibleItems = navItems.filter((item) => {
    if (item.public) return true
    if (item.protected) return isAuthenticated()
    return false
  })

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => setCurrentPage("home")} style={{ cursor: "pointer" }}>
          Boston House Predictor
        </div>

        <button className="nav-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <i className="fas fa-bars"></i>
        </button>

        <ul className={`nav-menu ${showMobileMenu ? "active" : ""}`}>
          {visibleItems.map((item) => (
            <li key={item.id}>
              <a
                className={`nav-link ${currentPage === item.id ? "active" : ""}`}
                onClick={() => {
                  setCurrentPage(item.id)
                  setShowMobileMenu(false)
                }}
                style={{ cursor: "pointer" }}
              >
                {item.label}
              </a>
            </li>
          ))}

          <li>
            <ThemeToggle />
          </li>

          {!isAuthenticated() ? (
            <>
              <li>
                <a
                  className="nav-link"
                  onClick={() => {
                    setCurrentPage("login")
                    setShowMobileMenu(false)
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Login
                </a>
              </li>
              <li>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => {
                    setCurrentPage("register")
                    setShowMobileMenu(false)
                  }}
                >
                  Register
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <span className="nav-link">Welcome, {user.name}!</span>
              </li>
              <li>
                <button className="btn btn--outline btn--sm" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

// Breadcrumb component
function Breadcrumb({ currentPage, setCurrentPage }) {
  const breadcrumbMap = {
    home: [{ label: "Home", page: "home" }],
    dashboard: [
      { label: "Home", page: "home" },
      { label: "Dashboard", page: "dashboard" },
    ],
    properties: [
      { label: "Home", page: "home" },
      { label: "Properties", page: "properties" },
    ],
    predictions: [
      { label: "Home", page: "home" },
      { label: "Predictions", page: "predictions" },
    ],
    map: [
      { label: "Home", page: "home" },
      { label: "Map View", page: "map" },
    ],
    profile: [
      { label: "Home", page: "home" },
      { label: "Profile", page: "profile" },
    ],
  }

  const breadcrumbs = breadcrumbMap[currentPage] || []

  if (breadcrumbs.length <= 1) return null

  return (
    <div className="container">
      <div className="breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.page}>
            <span
              className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? "active" : ""}`}
              onClick={() => index < breadcrumbs.length - 1 && setCurrentPage(crumb.page)}
              style={index < breadcrumbs.length - 1 ? { cursor: "pointer" } : {}}
            >
              {crumb.label}
            </span>
            {index < breadcrumbs.length - 1 && (
              <span className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Home page component
function HomePage({ setCurrentPage }) {
  return (
    <>
      <div className="hero">
        <div className="hero-content">
          <h1>Boston House Price Prediction</h1>
          <p>
            Get accurate house price predictions using advanced machine learning. Browse properties, analyze market
            trends, and make informed real estate decisions.
          </p>
          <div className="flex gap-16 justify-center">
            <button className="btn btn--primary btn--lg" onClick={() => setCurrentPage("register")}>
              Get Started
            </button>
            <button className="btn btn--outline btn--lg" onClick={() => setCurrentPage("predictions")}>
              Try Prediction Tool
            </button>
          </div>
          <p className="mt-16" style={{ color: "var(--color-text-secondary)" }}>
            Tip: You can switch themes anytime using the sun/moon button in the navbar.
          </p>
        </div>
      </div>

      <div className="container py-32">
        <div className="dashboard-grid">
          <div className="dashboard-card text-center">
            <i
              className="fas fa-home"
              style={{ fontSize: "3rem", color: "var(--color-primary)", marginBottom: "var(--space-16)" }}
            ></i>
            <h3>Property Listings</h3>
            <p>
              Browse comprehensive property listings across all Boston neighborhoods with detailed information and
              market insights.
            </p>
          </div>

          <div className="dashboard-card text-center">
            <i
              className="fas fa-chart-line"
              style={{ fontSize: "3rem", color: "var(--color-primary)", marginBottom: "var(--space-16)" }}
            ></i>
            <h3>ML Predictions</h3>
            <p>
              Get accurate price predictions using our Gradient Boosting machine learning model trained on Boston
              housing data.
            </p>
          </div>

          <div className="dashboard-card text-center">
            <i
              className="fas fa-map"
              style={{ fontSize: "3rem", color: "var(--color-primary)", marginBottom: "var(--space-16)" }}
            ></i>
            <h3>Interactive Maps</h3>
            <p>
              Explore Boston neighborhoods on interactive maps with property markers, filters, and neighborhood
              statistics.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// Login component
function LoginPage({ setCurrentPage }) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const user = appState.users.find((u) => u.email === formData.email && u.password === formData.password)

      if (user) {
        setCurrentUser(user)
        setCurrentPage("dashboard")
      } else {
        setError("Invalid email or password")
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="container py-32">
      <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
        <div className="card__body">
          <h2 className="text-center mb-16">Login</h2>

          {error && <div className="status status--error mb-16">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn--primary w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center mt-16">
            <p>Don't have an account? </p>
            <button className="btn btn--outline" onClick={() => setCurrentPage("register")}>
              Register
            </button>
          </div>

          <div className="text-center mt-16">
            <small style={{ color: "var(--color-text-secondary)" }}>
              Demo credentials:
              <br />
              Dealer: dealer@example.com / password123
              <br />
              Customer: customer@example.com / password123
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

// Register component
function RegisterPage({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "customer",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (appState.users.find((u) => u.email === formData.email)) {
      setError("Email already exists")
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: appState.users.length + 1,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name,
        phone: formData.phone,
      }

      appState.users.push(newUser)
      setLoading(false)
      setCurrentPage("login")
    }, 500)
  }

  return (
    <div className="container py-32">
      <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div className="card__body">
          <h2 className="text-center mb-16">Register</h2>

          {error && <div className="status status--error mb-16">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="customer">Customer</option>
                <option value="property_dealer">Property Dealer</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn--primary w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center mt-16">
            <p>Already have an account? </p>
            <button className="btn btn--outline" onClick={() => setCurrentPage("login")}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard component
function DashboardPage({ setCurrentPage }) {
  const user = getCurrentUser()
  const userProperties = appState.properties.filter((p) => p.dealerId === user.id)
  const totalProperties = appState.properties.length
  const avgPrice = appState.properties.reduce((sum, p) => sum + p.price, 0) / totalProperties

  if (user.role === "property_dealer") {
    return (
      <div className="container dashboard">
        <h1>Property Dealer Dashboard</h1>
        <p className="mb-16">Welcome back, {user.name}! Manage your properties and track performance.</p>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Your Properties</h3>
            <div className="stat-value">{userProperties.length}</div>
            <p>Active listings</p>
            <button className="btn btn--primary btn--sm" onClick={() => setCurrentPage("properties")}>
              Manage Properties
            </button>
          </div>

          <div className="dashboard-card">
            <h3>Total Inquiries</h3>
            <div className="stat-value">23</div>
            <p>This month</p>
            <button className="btn btn--outline btn--sm">View Inquiries</button>
          </div>

          <div className="dashboard-card">
            <h3>Revenue</h3>
            <div className="stat-value">$45,000</div>
            <p>Last 30 days</p>
            <button className="btn btn--outline btn--sm">View Analytics</button>
          </div>

          <div className="dashboard-card">
            <h3>Market Average</h3>
            <div className="stat-value">${Math.round(avgPrice).toLocaleString()}</div>
            <p>Boston area</p>
            <button className="btn btn--outline btn--sm" onClick={() => setCurrentPage("predictions")}>
              Price Analysis
            </button>
          </div>
        </div>

        <div className="card mt-16">
          <div className="card__body">
            <h3 className="mb-16">Quick Actions</h3>
            <div className="flex gap-16">
              <button className="btn btn--primary" onClick={() => setCurrentPage("properties")}>
                <i className="fas fa-plus mr-8"></i>
                Add Property
              </button>
              <button className="btn btn--outline" onClick={() => setCurrentPage("map")}>
                <i className="fas fa-map mr-8"></i>
                View Map
              </button>
              <button className="btn btn--outline" onClick={() => setCurrentPage("predictions")}>
                <i className="fas fa-chart-line mr-8"></i>
                Price Predictions
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Customer dashboard
  return (
    <div className="container dashboard">
      <h1>Customer Dashboard</h1>
      <p className="mb-16">Welcome back, {user.name}! Find your dream property.</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Saved Properties</h3>
          <div className="stat-value">{appState.favorites.length}</div>
          <p>In your favorites</p>
          <button className="btn btn--primary btn--sm" onClick={() => setCurrentPage("properties")}>
            View Favorites
          </button>
        </div>

        <div className="dashboard-card">
          <h3>Active Offers</h3>
          <div className="stat-value">2</div>
          <p>Pending response</p>
          <button className="btn btn--outline btn--sm">Track Offers</button>
        </div>

        <div className="dashboard-card">
          <h3>Price Predictions</h3>
          <div className="stat-value">5</div>
          <p>This month</p>
          <button className="btn btn--outline btn--sm" onClick={() => setCurrentPage("predictions")}>
            New Prediction
          </button>
        </div>

        <div className="dashboard-card">
          <h3>Market Trends</h3>
          <div className="stat-value">+3.2%</div>
          <p>Price increase</p>
          <button className="btn btn--outline btn--sm" onClick={() => setCurrentPage("map")}>
            View Trends
          </button>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card__body">
          <h3 className="mb-16">Quick Actions</h3>
          <div className="flex gap-16">
            <button className="btn btn--primary" onClick={() => setCurrentPage("properties")}>
              <i className="fas fa-search mr-8"></i>
              Search Properties
            </button>
            <button className="btn btn--outline" onClick={() => setCurrentPage("predictions")}>
              <i className="fas fa-calculator mr-8"></i>
              Price Calculator
            </button>
            <button className="btn btn--outline" onClick={() => setCurrentPage("map")}>
              <i className="fas fa-map-marker mr-8"></i>
              Explore Map
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Properties page component
function PropertiesPage({ setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    neighborhood: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    propertyType: "",
  })

  const filteredProperties = appState.properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesNeighborhood = !filters.neighborhood || property.neighborhood === filters.neighborhood
    const matchesMinPrice = !filters.minPrice || property.price >= Number.parseInt(filters.minPrice)
    const matchesMaxPrice = !filters.maxPrice || property.price <= Number.parseInt(filters.maxPrice)
    const matchesBedrooms = !filters.bedrooms || property.bedrooms === Number.parseInt(filters.bedrooms)
    const matchesType = !filters.propertyType || property.propertyType === filters.propertyType

    return matchesSearch && matchesNeighborhood && matchesMinPrice && matchesMaxPrice && matchesBedrooms && matchesType
  })

  const handleFavorite = (propertyId) => {
    const user = getCurrentUser()
    if (!user) return

    const favoriteIndex = appState.favorites.findIndex((f) => f.userId === user.id && f.propertyId === propertyId)
    if (favoriteIndex > -1) {
      appState.favorites.splice(favoriteIndex, 1)
    } else {
      appState.favorites.push({ userId: user.id, propertyId })
    }
  }

  const isFavorite = (propertyId) => {
    const user = getCurrentUser()
    if (!user) return false
    return appState.favorites.some((f) => f.userId === user.id && f.propertyId === propertyId)
  }

  return (
    <div className="container py-32">
      <div className="flex justify-between items-center mb-16">
        <h1>Properties</h1>
        {getCurrentUser()?.role === "property_dealer" && (
          <button className="btn btn--primary">
            <i className="fas fa-plus mr-8"></i>
            Add Property
          </button>
        )}
      </div>

      {/* Search and filters */}
      <div className="card mb-24">
        <div className="card__body">
          <div className="form-group mb-16">
            <input
              type="text"
              className="form-control"
              placeholder="Search properties by address or neighborhood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                className="form-control"
                value={filters.neighborhood}
                onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
              >
                <option value="">All Neighborhoods</option>
                {appState.neighborhoods.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <select
                className="form-control"
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="number"
                className="form-control"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                className="form-control"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Properties grid */}
      <div className="property-grid">
        {filteredProperties.map((property) => (
          <div key={property.id} className="property-card">
            <div className="property-image">
              <i className="fas fa-home" style={{ fontSize: "2rem" }}></i>
            </div>

            <div className="property-details">
              <div className="property-price">${property.price.toLocaleString()}</div>
              <div className="property-address">{property.address}</div>

              <div className="inline-badges mb-16">
                <span className="badge badge--info">
                  <i className="fas fa-building"></i> {property.propertyType}
                </span>
                <span className={property.status === "available" ? "badge badge--success" : "badge badge--warning"}>
                  <i className="fas fa-circle"></i> {property.status}
                </span>
                <span className="badge">
                  <i className="fas fa-tag"></i> {property.listingType}
                </span>
              </div>

              <div className="property-features">
                <span>
                  <i className="fas fa-bed"></i> {property.bedrooms} bed
                </span>
                <span>
                  <i className="fas fa-bath"></i> {property.bathrooms} bath
                </span>
                <span>
                  <i className="fas fa-ruler-combined"></i> {property.sqft} sqft
                </span>
              </div>

              <div className="property-actions">
                <button className="btn btn--primary btn--sm">View Details</button>
                <button
                  className={`btn btn--outline btn--sm ${isFavorite(property.id) ? "btn--primary" : ""}`}
                  onClick={() => handleFavorite(property.id)}
                  aria-pressed={isFavorite(property.id)}
                  aria-label={isFavorite(property.id) ? "Remove from favorites" : "Add to favorites"}
                  title={isFavorite(property.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <i className={`fas fa-heart ${isFavorite(property.id) ? "" : "far"}`}></i>
                </button>
                {getCurrentUser()?.role === "customer" && (
                  <button className="btn btn--secondary btn--sm">Make Offer</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-32">
          <i
            className="fas fa-search"
            style={{ fontSize: "3rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-16)" }}
          ></i>
          <h3>No properties found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  )
}

// Predictions page component
function PredictionsPage({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    CRIM: 0.00632,
    ZN: 18.0,
    INDUS: 2.31,
    CHAS: 0,
    NOX: 0.538,
    RM: 6.575,
    AGE: 65.2,
    DIS: 4.09,
    RAD: 1,
    TAX: 296,
    PTRATIO: 15.3,
    B: 396.9,
    LSTAT: 4.98,
  })
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confidence, setConfidence] = useState(null)

  // Simple ML prediction function (simulated)
  const predictPrice = (features) => {
    // This is a simplified simulation of the Boston housing model
    // In a real application, this would call an ML API
    const basePrice = 24.0 // Mean of Boston housing dataset

    // Feature weights (simplified)
    const weights = {
      CRIM: -0.1,
      ZN: 0.05,
      INDUS: -0.02,
      CHAS: 2.7,
      NOX: -17.8,
      RM: 3.8,
      AGE: -0.01,
      DIS: 1.3,
      RAD: 0.3,
      TAX: -0.012,
      PTRATIO: -0.95,
      B: 0.009,
      LSTAT: -0.53,
    }

    let adjustedPrice = basePrice
    Object.keys(weights).forEach((feature) => {
      adjustedPrice += features[feature] * weights[feature]
    })

    // Convert to thousands and ensure positive
    const price = Math.max(adjustedPrice * 1000, 50000)
    const confidenceScore = Math.random() * 0.3 + 0.7 // Random confidence between 70-100%

    return { price, confidence: confidenceScore }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const result = predictPrice(formData)
      setPrediction(result.price)
      setConfidence(result.confidence)

      // Save prediction to history
      appState.predictions.push({
        id: Date.now(),
        userId: getCurrentUser().id,
        features: { ...formData },
        prediction: result.price,
        confidence: result.confidence,
        timestamp: new Date(),
      })

      setLoading(false)
    }, 1000)
  }

  const handleInputChange = (feature, value) => {
    setFormData({
      ...formData,
      [feature]: Number.parseFloat(value) || 0,
    })
  }

  return (
    <div className="container py-32">
      <h1>House Price Predictions</h1>
      <p className="mb-24">
        Enter property characteristics to get an ML-powered price prediction using the Boston Housing dataset model.
      </p>

      <div className="prediction-form">
        <h2 className="mb-24">Property Features</h2>

        <form onSubmit={handleSubmit}>
          {Object.entries(HOUSING_FEATURES).map(([feature, description]) => (
            <div key={feature} className="form-group">
              <label className="form-label">
                {feature}: {description}
              </label>
              <input
                type="number"
                step="0.001"
                className="form-control"
                value={formData[feature]}
                onChange={(e) => handleInputChange(feature, e.target.value)}
                required
              />
            </div>
          ))}

          <button type="submit" className="btn btn--primary btn--lg w-full" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>Calculating Prediction...
              </>
            ) : (
              "Predict Price"
            )}
          </button>
        </form>
      </div>

      {prediction && (
        <div className="prediction-result">
          <h3>Prediction Result</h3>
          <div className="prediction-price">${Math.round(prediction).toLocaleString()}</div>
          <p>Confidence Score: {Math.round(confidence * 100)}%</p>
          <div className="flex gap-16 justify-center mt-16">
            <button
              className="btn btn--outline"
              onClick={() => {
                setPrediction(null)
                setConfidence(null)
              }}
            >
              New Prediction
            </button>
            <button className="btn btn--primary" onClick={() => setCurrentPage("properties")}>
              Browse Properties
            </button>
          </div>
        </div>
      )}

      {appState.predictions.filter((p) => p.userId === getCurrentUser().id).length > 0 && (
        <div className="card mt-24">
          <div className="card__body">
            <h3 className="mb-16">Recent Predictions</h3>
            <div className="property-grid">
              {appState.predictions
                .filter((p) => p.userId === getCurrentUser().id)
                .slice(-3)
                .map((pred) => (
                  <div key={pred.id} className="dashboard-card">
                    <div className="stat-value">${Math.round(pred.prediction).toLocaleString()}</div>
                    <p>Confidence: {Math.round(pred.confidence * 100)}%</p>
                    <small style={{ color: "var(--color-text-secondary)" }}>
                      {pred.timestamp.toLocaleDateString()}
                    </small>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Map view component
function MapViewPage({ setCurrentPage }) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null)
  const [showProperties, setShowProperties] = useState(false)

  return (
    <div className="container py-32">
      <h1>Boston Neighborhoods Map</h1>
      <p className="mb-24">Explore Boston neighborhoods and property distributions.</p>

      <div className="card mb-24">
        <div className="card__body">
          <div className="flex gap-16 mb-16">
            <button
              className={`btn ${showProperties ? "btn--outline" : "btn--primary"}`}
              onClick={() => setShowProperties(false)}
            >
              Neighborhoods
            </button>
            <button
              className={`btn ${showProperties ? "btn--primary" : "btn--outline"}`}
              onClick={() => setShowProperties(true)}
            >
              Properties
            </button>
          </div>

          <div className="map-container">
            <div className="text-center">
              <i className="fas fa-map" style={{ fontSize: "4rem", marginBottom: "var(--space-16)" }}></i>
              <h3>Interactive Boston Map</h3>
              <p>Click on markers to view neighborhood or property details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {appState.neighborhoods.slice(0, 6).map((neighborhood) => (
          <div key={neighborhood.name} className="dashboard-card">
            <h3>{neighborhood.name}</h3>
            <div className="stat-value">{neighborhood.properties}</div>
            <p>Available properties</p>
            <div className="flex gap-8">
              <button className="btn btn--outline btn--sm" onClick={() => setSelectedNeighborhood(neighborhood)}>
                View Details
              </button>
              <button className="btn btn--primary btn--sm" onClick={() => setCurrentPage("properties")}>
                Browse
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedNeighborhood && (
        <div className="card mt-24">
          <div className="card__body">
            <h3>{selectedNeighborhood.name} Details</h3>
            <div className="form-row">
              <div>
                <p>
                  <strong>Coordinates:</strong> {selectedNeighborhood.lat}, {selectedNeighborhood.lng}
                </p>
                <p>
                  <strong>Available Properties:</strong> {selectedNeighborhood.properties}
                </p>
              </div>
              <div className="text-right">
                <button className="btn btn--outline" onClick={() => setSelectedNeighborhood(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Profile page component
function ProfilePage({ setCurrentPage }) {
  const [user, setUser] = useState(getCurrentUser())
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email,
  })

  const handleSave = () => {
    // Update user in appState
    const userIndex = appState.users.findIndex((u) => u.id === user.id)
    if (userIndex > -1) {
      appState.users[userIndex] = { ...user, ...formData }
      setCurrentUser(appState.users[userIndex])
      setUser(appState.users[userIndex])
    }
    setEditing(false)
  }

  const userStats = {
    predictions: appState.predictions.filter((p) => p.userId === user.id).length,
    favorites: appState.favorites.filter((f) => f.userId === user.id).length,
    properties: user.role === "property_dealer" ? appState.properties.filter((p) => p.dealerId === user.id).length : 0,
  }

  return (
    <div className="container py-32">
      <h1>Profile</h1>
      <p className="mb-24">Manage your account settings and preferences.</p>

      <div className="form-row">
        <div className="card">
          <div className="card__body">
            <div className="flex justify-between items-center mb-16">
              <h3>Personal Information</h3>
              <button className="btn btn--outline btn--sm" onClick={() => (editing ? handleSave() : setEditing(true))}>
                {editing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            {editing ? (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone}
                </p>
                <p>
                  <strong>Role:</strong> {user.role === "property_dealer" ? "Property Dealer" : "Customer"}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <h3 className="mb-16">Activity Summary</h3>

            <div className="dashboard-card" style={{ margin: "0 0 var(--space-16) 0" }}>
              <div className="stat-value">{userStats.predictions}</div>
              <p>Price Predictions</p>
            </div>

            <div className="dashboard-card" style={{ margin: "0 0 var(--space-16) 0" }}>
              <div className="stat-value">{userStats.favorites}</div>
              <p>Saved Properties</p>
            </div>

            {user.role === "property_dealer" && (
              <div className="dashboard-card" style={{ margin: "0" }}>
                <div className="stat-value">{userStats.properties}</div>
                <p>Listed Properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-24">
        <div className="card__body">
          <h3 className="mb-16">Quick Actions</h3>
          <div className="flex gap-16">
            <button className="btn btn--primary" onClick={() => setCurrentPage("dashboard")}>
              <i className="fas fa-tachometer-alt mr-8"></i>
              Dashboard
            </button>
            <button className="btn btn--outline" onClick={() => setCurrentPage("properties")}>
              <i className="fas fa-home mr-8"></i>
              Browse Properties
            </button>
            <button className="btn btn--outline" onClick={() => setCurrentPage("predictions")}>
              <i className="fas fa-calculator mr-8"></i>
              Price Calculator
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Chatbot component
function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I'm your Boston real estate assistant. How can I help you today?" },
  ])
  const [inputValue, setInputValue] = useState("")

  const generateResponse = (userMessage) => {
    const message = userMessage.toLowerCase()

    if (message.includes("price") || message.includes("predict")) {
      return "I can help you predict house prices! Use our ML prediction tool by entering property features like crime rate, number of rooms, and neighborhood characteristics."
    } else if (message.includes("neighborhood") || message.includes("area")) {
      return "Boston has many great neighborhoods! Popular areas include Back Bay, Beacon Hill, and South End. Each has different characteristics affecting property values."
    } else if (message.includes("feature") || message.includes("factor")) {
      return "Key factors affecting Boston house prices include: number of rooms (RM), crime rate (CRIM), proximity to employment centers (DIS), and neighborhood characteristics."
    } else if (message.includes("property") || message.includes("house")) {
      return "Browse our property listings to find homes across Boston. You can filter by neighborhood, price range, bedrooms, and property type."
    } else if (message.includes("help") || message.includes("how")) {
      return "I can help with property searches, price predictions, neighborhood information, and explaining housing market factors. What would you like to know?"
    } else {
      return "That's interesting! I specialize in Boston real estate. Feel free to ask about property prices, neighborhoods, or market trends."
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage = { type: "user", text: inputValue }
    const botResponse = { type: "bot", text: generateResponse(inputValue) }

    setMessages((prev) => [...prev, userMessage, botResponse])
    setInputValue("")
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-comments"></i>
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h4>AI Assistant</h4>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about Boston real estate..."
            />
            <button className="btn btn--primary btn--sm" onClick={handleSendMessage}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Protected route wrapper
function ProtectedRoute({ children, setCurrentPage }) {
  if (!isAuthenticated()) {
    return (
      <div className="container py-32">
        <div className="card text-center" style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div className="card__body">
            <i
              className="fas fa-lock"
              style={{ fontSize: "3rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-16)" }}
            ></i>
            <h3>Access Restricted</h3>
            <p>Please log in to access this page.</p>
            <div className="flex gap-16 justify-center">
              <button className="btn btn--primary" onClick={() => setCurrentPage("login")}>
                Login
              </button>
              <button className="btn btn--outline" onClick={() => setCurrentPage("register")}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
}

// Footer component
function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} Boston House Predictor</span>
        <nav className="footer-links" aria-label="Footer">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Privacy
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Terms
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}

// Main App component
function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} />
      case "login":
        return <LoginPage setCurrentPage={setCurrentPage} />
      case "register":
        return <RegisterPage setCurrentPage={setCurrentPage} />
      case "dashboard":
        return (
          <ProtectedRoute setCurrentPage={setCurrentPage}>
            <DashboardPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        )
      case "properties":
        return (
          <ProtectedRoute setCurrentPage={setCurrentPage}>
            <PropertiesPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        )
      case "predictions":
        return (
          <ProtectedRoute setCurrentPage={setCurrentPage}>
            <PredictionsPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        )
      case "map":
        return (
          <ProtectedRoute setCurrentPage={setCurrentPage}>
            <MapViewPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        )
      case "profile":
        return (
          <ProtectedRoute setCurrentPage={setCurrentPage}>
            <ProfilePage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        )
      default:
        return <HomePage setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="App">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />

      <Breadcrumb currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main>{renderPage()}</main>

      {/* Chatbot remains authenticated-only */}
      {isAuthenticated() && <Chatbot />}

      <Footer />
    </div>
  )
}

// Render the app
ReactDOM.render(<App />, document.getElementById("root"))
