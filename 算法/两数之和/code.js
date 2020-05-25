var twoSum = function (nums, target) {
    let targetMap = new Map()
    for (let i = 0; i < nums.length; i++) {
        const key = target - nums[i]
        targetMap.set(nums[i], i)
        if (targetMap.has(key)) {
            return [targetMap.get(key), i]
        }
    }
}

let res = twoSum([5, 2, 11, 15, 7, 6], 9)
console.log(res)