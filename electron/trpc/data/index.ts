import { t } from "../trpc"
import { dataGamesRouter } from "./games"
import { dataSettingsRouter } from "./settings"
import { dataProfilesRouter } from "./profiles"
import { dataModsRouter } from "./mods"

export const dataRouter = t.router({
  games: dataGamesRouter,
  settings: dataSettingsRouter,
  profiles: dataProfilesRouter,
  mods: dataModsRouter,
})
