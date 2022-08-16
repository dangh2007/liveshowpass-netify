
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }
}

contract Marketplace {

    uint internal passLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address public adminAddress;
    
    using SafeMath for uint;

    struct pass {
        address payable owner;
        string name;
        string image;
        string location;
        uint price;
        uint sold;
        bool verified;
    }

    constructor(){
        adminAddress = msg.sender;
    }

    modifier isVerified(uint _index) {
        require(pass[_index].verified == true, "this pass is not verified");
        _;
    }

    modifier isAdmin() {
        require(msg.sender == adminAddress, "only callable by admin");
        _;
    }

    mapping (uint => pass) public pass;
       _;
    }

    function writepass(
        string memory _name,
        string memory _image,
        string memory _description,
        string memory _location,
        uint _price
    ) public {
        require(bytes(_image).length > 0, "Please enter a valid image URL");
        require(bytes(_description).length > 0, "Please enter a valid description");
        require(bytes(_name).length > 0, "Please enter a valid name");
        require(_price > 0, "enter a valid price");
        uint _sold = 0;
        bool _verified = false;
        pass[passLength] = pass(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _location,
            _price,
            _sold,
            _verified
        );
        passLength = passLength.add(1);
    }

    function buypass(uint _index) public  payable isVerified(_index)  {
        require(pass[_index].owner != address(0), "enter a valid pass index");
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                pass[_index].owner,
                pass[_index].price
            ),
            "Transfer failed."
        );
        pass[_index].sold = pass[_index].sold.add(1);
    }

    function getpassLength() public view returns (uint) {
        return (passLength);
    }


    //    admin can veridy a prodyct
    function verifypass(uint _index) public  isAdmin {
        pass[_index].verified = true;
    }

    function revokeOwnership(address _address) public isAdmin {
        adminAddress = _address;
    }

}
    
