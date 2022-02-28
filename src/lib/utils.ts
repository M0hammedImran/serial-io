import { LinuxBinding } from '@serialport/bindings-cpp';

/**
 * @param {number} ms
 * @description sleep for a given time
 * @return {Promise<void>} Promise<void>
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @description convert hexadecimal to string
 * @param {string} hex string
 * @return {string} string
 */
export function hex2str(hex: string): string {
    const str = (hex.match(/[\s\S]{1,2}/g) || []).filter((v) => v !== '00');
    return str.map((v) => String.fromCharCode(parseInt(v, 16))).join('');
}

export async function getNodes() {
    const list = await LinuxBinding.list();

    return list
        .filter((device) => Boolean(device.vendorId))
        .map((device) => ({ path: device.path, pnpId: device.pnpId }));
}

export const INFO = `{info:type}`;

export const START_GUN = `{CC:start}`;
export const STOP_GUN = `{CC:stop}`;

export const STOP_TARGET = `{HC:stop}`;
export const START_TARGET = `{HC:start}`;

// export const ACTIVATE_TARGET = `{HC:activate}`;
export const setActiveDuration = (duration: number) => `HC:${duration}`;

interface SetGunAttributesProps {
    ammo_count: string | number;
    mag_count?: string | number;
    trigger_rate?: string | number;
    reload_delay?: string | number;
    range?: string | number;
    bullet_id?: string | number;
    respawn_count?: string | number;
    respawn_delay?: string | number;
    haptic_level?: string | number;
}

export const setGunAttributes = ({
    ammo_count = '',
    mag_count = '',
    trigger_rate = '',
    reload_delay = '',
    range = '',
    bullet_id = '',
    respawn_count = '',
    respawn_delay = '',
    haptic_level = '',
}: SetGunAttributesProps) =>
    `GV:${ammo_count},${mag_count},${trigger_rate},${reload_delay},${range},${bullet_id},${respawn_count},${respawn_delay},${haptic_level}`;

/* 
    const setGunAttributes = ({
        ammo_count = '',
        mag_count = '',
        trigger_rate = '',
        reload_delay = '',
        range = '',
        bullet_id = '',
        respawn_count = '',
        respawn_delay = '',
        haptic_level = '',
    }) =>
    `GV:${ammo_count},${mag_count},${trigger_rate},${reload_delay},${range},${bullet_id},${respawn_count},${respawn_delay},${haptic_level}`;

    setGunAttributes({ammo_count:15,haptic_level: 3})
*/
