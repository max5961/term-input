import { enableKittyProtocol } from "./enableKittyProtocol.js";
import { enableMouse } from "./enableMouse.js";

export type ConfigureReturn = {
    readonly stdout?: NodeJS.WriteStream;
    readonly enableMouse?: typeof enableMouse;
    readonly kittySupported?: boolean;
};

export type Opts = {
    /**
     * The stdout stream that configuration escape codes are sent to
     * @default process.stdout
     */
    stdout?: NodeJS.WriteStream;

    /**
     * One reason you might *not* want this on is that is may alter the cusor in
     * many terminals and prevent copying text
     * @default true
     */
    enableMouse?: boolean;

    /**
     * @param 0 button press & release + position on mouse event
     * @param 3 mouse movement events + everything from `0`
     * @default 3
     */
    mouseMode?: 0 | 3;

    /**
     * Enable or disable Kitty's extended keyboard layout
     * @link *https://sw.kovidgoyal.net/kitty/keyboard-protocol/*
     *
     * `configureStdin` returns `{ kittySupported }` which must be passed to
     * parseBuffer in order to parse Kitty protocol sequences
     *
     * @default true (if the terminal does not support it, it does nothing)
     */
    enableKittyProtocol?: boolean;
};

export function configureStdin(opts: Opts = {}) {
    opts.stdout = opts.stdout ?? process.stdout;
    opts.enableMouse = opts.enableMouse ?? true;
    opts.mouseMode = opts.mouseMode ?? 3;
    opts.enableKittyProtocol = opts.enableKittyProtocol ?? true;

    if (!process.stdin.isTTY) {
        throw new Error("Terminal does not support raw mode.");
    } else {
        process.stdin.setRawMode(true);
    }

    let kittyEnabled = false;
    if (opts.enableKittyProtocol) {
        enableKittyProtocol({
            stdout: opts.stdout,
            enabled: opts.enableKittyProtocol,
        }).then((supported) => (kittyEnabled = supported));
    }

    enableMouse({
        enabled: opts.enableMouse,
        mode: opts.mouseMode,
        stdout: opts.stdout,
    });

    return Object.freeze({
        /**
         * The stdout stream chosen in the configuration options
         */
        stdout: opts.stdout,

        /**
         * Represents is has been enabled in the configuration options
         */
        enableMouse: enableMouse,

        /**
         * @returns `boolean` representing whether or not the Kitty Protocol is
         * enabled and supported.
         *
         * **NOTE:** This function relies on an async operation that queries the
         * terminal, so calling immediately after configuration will always return
         * `false`
         */
        kittySupported() {
            return kittyEnabled;
        },
    });
}
