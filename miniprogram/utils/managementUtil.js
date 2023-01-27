const db = wx.cloud.database();

/**
 * 上传图片
 * @param {参数} params 
 */
export const chooseimage=(params)=>{
    return new Promise((resolve,reject)=>{
        let path=params.path;
        let imgName=params.imgName;
            wx.chooseImage({
                success: result => {
                  console.log(result.tempFilePaths[0])
                  console.log(result)
                  result.tempFilePaths[0]
                  wx.cloud.uploadFile({
                    cloudPath: path+"/" +imgName+ `.png`,
                    filePath: result.tempFilePaths[0]
                  }).then(res => {
                    // 获取响应结果
                    console.log(res);
                    resolve(res.fileID)
                  }).catch(err => {
                    console.log(err)
                    reject(err);
                  })
                }
              });
    })
}