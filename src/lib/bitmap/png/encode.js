import {PNG} from "pngjs";

export default bitmap => PNG.sync.write(bitmap);