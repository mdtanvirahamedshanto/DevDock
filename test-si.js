const si = require('systeminformation');

async function dump() {
  const data = {
    cpu: await si.cpu(),
    load: await si.currentLoad(),
    mem: await si.mem(),
    graphics: await si.graphics(),
    fs: await si.fsSize(),
    battery: await si.battery(),
    bluetooth: await si.bluetoothDevices(),
    temp: await si.cpuTemperature()
  };
  console.log(JSON.stringify(data, null, 2));
}

dump();
