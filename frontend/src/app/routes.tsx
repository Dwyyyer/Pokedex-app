import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { PokemonDetail } from "./pages/PokemonDetail";
import { Profile } from "./pages/Profile";
import { UserProfile } from "./pages/UserProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/pokemon/:id",
    Component: PokemonDetail,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/user/:username",
    Component: UserProfile,
  },
]);
