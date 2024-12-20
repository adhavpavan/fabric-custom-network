const { initiateProjectCreation } = require('../jobs/createProject');
const ConfigurationData = require('../models/configurationData');

const Org = require('../models/org.model');
const Subscription = require('../models/subscription.model');
const { REQUEST_STATUS } = require('../utils/Constants');

const getAllOrganizations = async (options, user) => {
  console.log('++++++options+++++', options, user);
  let filter = {userId:user.email}
  return Org.paginate(filter, options);
};

const getOrganizationById = async (id) => {
  return Org.findById(id);
};

const getModifiedObject = (data)=> {

  let peerPorts = 7051
  let caPort= 7054

  let orgs = data.filter(elm => elm.orgType == "Peer")
  let ordererOrg = data.filter(elm => elm.orgType != "Peer")

  let o = []
  let ports= []

  for (let a =0; a< orgs.length; a++){
    ports= []
    let org = orgs[a]
    for(let b =1; b<=org.peerCount; b++){
      ports.push(peerPorts)
      peerPorts += 1000
    }
    org.peerPorts = ports
    org.caPort= caPort
    o.push(org)
    caPort +=1000
  }

  ordererOrg.caPort = caPort

  console.log("----------ordererOrg-----------", ordererOrg)

  console.log("-------------new static data--------", [...o, ...ordererOrg] )

  return [...o, ...ordererOrg]

}




const createOrganization = async (data, user) => {
  console.log('--service data----', data);
let requestModel = new Org({
  configuration: data,
  projectName: data?.projectName,
  createdBy: user.email,
  updatedBy: user.email,
  userId: user.email,
  status: REQUEST_STATUS.INPROGRESS,
})

let config = await ConfigurationData.findOne({id: 'CONFIGURATION'})
  console.log("-----------------", typeof config?.data, config?.data)
  let configData = JSON.parse(config?.data)
  if(configData){
    // let data = JSON.parse(config?.data)
    if(configData?.isEnabled){
      const res = await Subscription.updateOne(
        { email: user.email, credit: { $gt: 0 } }, // Ensure there are enough credits
        { $inc: { credit: -1 } }
      ).exec();
      console.log('+++++++geting subscription res---', res);
    }
  }

  console.log("---------requestModel----------", requestModel)

  let modifiedPorts = getModifiedObject(data.Organizations)
  data.Organizations = modifiedPorts

  console.log("Request received from user", data)

  await initiateProjectCreation(data,  user.email, requestModel._id)

  requestModel.status = REQUEST_STATUS.COMPLETED

  return requestModel.save();
};

const updateOrganization = async (id, newData) => {
  return Org.findByIdAndUpdate(id, newData, { new: true });
};

const deleteOrganization = async (id) => {
  return Org.findByIdAndDelete(id);
};

module.exports = {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
};
