import {BrowserRouter,Routes,Route, Navigate} from "react-router-dom";
import HomePageHero from "./pages/homepage_hero";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
             {/* default home page when starting development server */}
            <Route path="/" element={<Navigate to="/homepage_hero" />} />

            <Route path="/homepage_hero" element={<HomePageHero />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App



// reference
// Router Setup

// import {BrowserRouter,Routes,Route} from "react-router-dom";
// import Home from "./pages/home";
// import FullCollection from "./pages/collection";
// import GameDetails from "./pages/game_detail";
// import AddGame from "./pages/add_game";

// function App() {
//   return (

//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/home" element={<Home/>} />
//         <Route path="/collection" element={<FullCollection />} />
//         <Route path="/add_game" element ={<AddGame />} />
//         {/* Route with the ID parameter */}
//         <Route path="/game_details/:id" element={<GameDetails />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
