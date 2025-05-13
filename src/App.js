import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { env, config, api, utils } from "mdye";

// 定义默认菜单列表，当无法从明道云获取数据时使用
const DEFAULT_MENU_LIST = [
  "汉堡", "披萨", "寿司", "火锅", "炸鸡", "牛排", "沙拉", "面条", "烤肉", "煎饼", "饺子", "麦当劳", "德克士", "牛肉面", "炸鱼薯条", "满汉全席", "包子和粥","猪脚盖饭","黄焖鸡米饭","重庆小面","卤肉饭","烧烤"
];

// 菜单闪烁动画
const flash = keyframes`
  0% { opacity: 0; transform: scale(1.5); color: transparent; text-shadow: 0 0 5px rgba(0,0,0,.5); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: scale(0.5); }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: #f5f6f7;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainArea = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #e9e9e9;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
`;

const BgArea = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #e9e9e9;
  z-index: 0;
`;

const TempContainer = styled.div`
  transform: translate3d(0, 0, 0);
  overflow: hidden;
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
`;

const CenterBox = styled.div`
  position: absolute;
  width: 90%;
  max-width: 640px;
  left: 50%; 
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  text-align: center;
`;

const CenterTitle = styled.h1`
  margin: 0 0 30px;
  padding: 0;
  font-weight: 400;
  font-size: 48px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  min-height: 48px;
  
  .what {
    font-weight: 700;
    color: #111;
  }
`;

const MainButton = styled.div`
  background: rgba(0, 0, 0, 0.1);
  border-radius: 40px;
  padding: 5px;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.07), 0 1px rgba(255, 255, 255, 0.5);
  display: inline-block;
  cursor: pointer;
  
  span {
    border-radius: 35px;
    width: 180px;
    height: 60px;
    line-height: 60px;
    background: linear-gradient(to bottom, #ffba30, #ff911e);
    color: #fff;
    text-align: center;
    display: block;
    font-size: 28px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    box-shadow: inset 0 1px #ffd17c, 0 2px 3px rgba(0, 0, 0, 0.2);
    border: 1px solid #e88e1d;
    transition: background 0.2s, box-shadow 0.2s;
  }
  
  &:hover span {
    background: linear-gradient(to bottom, #ffce44, #ffa532);
    box-shadow: inset 0 1px #ffe696, 0 2px 3px rgba(0, 0, 0, 0.2);
  }
  
  &:active span {
    background: linear-gradient(to bottom, #ff911e, #ffbb30);
    box-shadow: inset 0 1px #ffb050, 0 2px 3px rgba(0, 0, 0, 0.2);
  }
`;

const HistoryContainer = styled.div`
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
    display: flex;
    justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 20px;
  z-index: 4;
`;

const HistoryItem = styled.div`
  padding: 5px 15px;
  background: linear-gradient(to bottom, #ffba30, #ff911e);
  border-radius: 20px;
  color: #fff;
      font-size: 18px;
  font-weight: 500;
`;

// 生成随机值
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// 解析JSON字符串并提取 name/departmentName 字段
function parseJsonAndGetName(value) {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    value === 'undefined'
  ) {
    return '';
  }
  try {
    // 兼容数组或对象
    let parsedValue = value;
    if (typeof value === 'string') {
      parsedValue = JSON.parse(value);
    }
    if (Array.isArray(parsedValue)) {
      if (parsedValue.length === 0) {
        return '';
      }
      // 取第一个对象的 name/fullname/departmentName 字段
      const item = parsedValue[0];
      if (item && item.name) {
        return item.name;
      }
      if (item && item.fullname) {
        return item.fullname;
      }
      if (item && item.departmentName) {
        return item.departmentName;
      }
    } else if (parsedValue && parsedValue.name) {
      return parsedValue.name;
    } else if (parsedValue && parsedValue.fullname) {
      return parsedValue.fullname;
    } else if (parsedValue && parsedValue.departmentName) {
      return parsedValue.departmentName;
    }
  } catch (e) {
    // 非 JSON 字符串直接返回原值
    return value;
  }
  return value;
}

// 数字格式化函数，去除多余0和小数点
function formatNumber(value) {
  if (typeof value === 'number') {
    return value.toString().replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
  }
  if (typeof value === 'string' && value !== '') {
    if (!isNaN(value)) {
      return parseFloat(value).toString().replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
    }
  }
  return value;
}

// 附件字段格式化函数，显示为文件名+后缀
function formatAttachment(value) {
  if (!value || value === '[]') return '';
  let files = [];
  try {
    if (typeof value === 'string') {
      files = JSON.parse(value);
    } else if (Array.isArray(value)) {
      files = value;
    }
    if (!Array.isArray(files)) return '';
    return files.map(f => (f.originalFilename ? `${f.originalFilename}${f.ext || ''}` : '')).filter(Boolean).join(', ');
  } catch (e) {
    return '';
  }
}

// 选项字段格式化函数，获取选项文本
function formatOptions(value, control) {
  if (!value || value === '[]') return '';
  let selectedKeys = [];
  try {
    selectedKeys = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(selectedKeys)) {
      selectedKeys = [selectedKeys];
    }
    if (!control || !control.options) return selectedKeys.join(', ');
    
    return selectedKeys
      .map(key => {
        const option = control.options.find(opt => {
          if (typeof key === 'string' && (key.indexOf('other') > -1 || key.indexOf('add_') > -1)) {
            return key.indexOf(opt.key) > -1;
          }
          return key === opt.key;
        });
        return option ? option.value : key;
      })
      .filter(Boolean)
      .join(', ');
  } catch (e) {
    return value;
  }
}

// 清洗并格式化字段值
function formatFieldValue(value, control) {
  if (value === undefined || value === null || value === '' || value === 'undefined') {
    return '';
  }
  
  // 如果 value 是空数组或 '[]'，直接返回空字符串
  if (value === '[]' || (Array.isArray(value) && value.length === 0)) {
    return '';
  }
  
  if (!control) return value;
  
  // 根据控件类型进行不同处理
  switch (control.type) {
    case 3: // 人员/部门
    case 27: // 人员多选
    case 26: // 部门多选
      return parseJsonAndGetName(value);
    case 6: // 数字
    case 8: // 金额
      return formatNumber(value);
    case 14: // 附件
      return formatAttachment(value);
    case 9: // 单选
    case 10: // 多选
    case 11: // 下拉选择
      return formatOptions(value, control);
    default:
      // 尝试JSON解析
      const name = parseJsonAndGetName(value);
      if (name && name !== value) return name;
      
      // 其他类型直接返回值
      return value;
  }
}

export default function App() {
  // 获取明道云配置参数
  const { appId, worksheetId, viewId, controls } = config;
  const { field, title, text } = env; // 从params-config.json中获取参数
  
  // 状态：init 初始，running 抽奖中，stopped 已定格
  const [status, setStatus] = useState('init');
  const [mainMenu, setMainMenu] = useState('');
  const [history, setHistory] = useState([]);
  const [menuList, setMenuList] = useState(DEFAULT_MENU_LIST); // 使用默认菜单列表
  const [loading, setLoading] = useState(true);
  const tempContainerRef = useRef(null);
  const timerRef = useRef();
  const flashTimerRef = useRef();
  
  // 从明道云获取数据
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 优先使用自定义文本作为菜单选项
        if (text && text.trim() !== '') {
          const customItems = text.split(/[,，、\r\n]+/).filter(item => item.trim() !== '');
          if (customItems.length > 0) {
            setMenuList(customItems);
            setLoading(false);
            return;
          }
        }
        
        // 如果没有配置字段或没有自定义文本，使用默认菜单
        if (!field || field.length === 0) {
          console.log("未配置字段，使用默认菜单");
          setLoading(false);
          return;
        }
        
        // 获取明道云数据
        const result = await api.getFilterRows({
          worksheetId,
          viewId,
          pageSize: 100,
          pageIndex: 1
        });
        
        if (result.data && result.data.length > 0) {
          // 从每条记录中提取指定字段值
          const menuItems = [];
          
          result.data.forEach(record => {
            field.forEach(fieldId => {
              const control = controls.find(c => c.controlId === fieldId);
              if (control && record[fieldId] !== undefined) {
                // 处理不同类型的字段
                const value = record[fieldId];
                const formattedValue = formatFieldValue(value, control);
                
                // 确保值是有效的字符串
                if (formattedValue && formattedValue.toString().trim() !== '') {
                  menuItems.push(formattedValue.toString());
                }
              }
            });
          });
          
          // 去重
          const uniqueItems = [...new Set(menuItems)];
          
          if (uniqueItems.length > 0) {
            //console.log(`成功加载${uniqueItems.length}个菜单项`);
            setMenuList(uniqueItems);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("获取数据失败:", error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, [field]);

  // 添加闪烁菜单项
  const addFlashMenuItem = () => {
    if (!tempContainerRef.current || status !== 'running') return;
    
    const left = getRandom(5, 90);
    const top = getRandom(10, 80);
    const size = getRandom(22, 38);
    const menuText = menuList[Math.floor(Math.random() * menuList.length)];
    
    const menuItem = document.createElement('div');
    menuItem.className = 'temp-menu-item';
    menuItem.style.position = 'absolute';
    menuItem.style.top = top + '%';
    menuItem.style.left = left + '%';
    menuItem.style.color = '#777';
    menuItem.style.fontSize = size + 'px';
    menuItem.style.opacity = '0';
    menuItem.style.animation = 'flash 1.6s ease-out both';
    menuItem.style.whiteSpace = 'nowrap';
    menuItem.textContent = menuText;
    
    tempContainerRef.current.appendChild(menuItem);
    
    // 动画结束后移除元素
    setTimeout(() => {
      if (menuItem.parentNode) {
        menuItem.parentNode.removeChild(menuItem);
      }
    }, 1600);
  };

  // 开始抽奖
  const startSelection = () => {
    setStatus('running');
    setMainMenu(menuList[Math.floor(Math.random() * menuList.length)]);
  };

  // 控制背景菜单闪烁
  useEffect(() => {
    if (status === 'running') {
      // 定期添加新的闪烁菜单项
      flashTimerRef.current = setInterval(addFlashMenuItem, 200);
    } else {
      clearInterval(flashTimerRef.current);
    }
    
    return () => clearInterval(flashTimerRef.current);
  }, [status]);

  // 控制中心菜单变换
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        const randomMenu = menuList[Math.floor(Math.random() * menuList.length)];
        setMainMenu(randomMenu);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [status, menuList]);

  // 保存历史记录
  useEffect(() => {
    if (status === 'stopped' && mainMenu) {
      const newHistory = [mainMenu, ...history.slice(0, 9)]; // 最多保存10条记录
      setHistory(newHistory);
    }
  }, [status, mainMenu]);

  // 按钮点击逻辑
  const handleBtn = () => {
    if (status === 'init') {
      startSelection();
    } else if (status === 'running') {
      setStatus('stopped');
    } else {
      // 点击"再来一次"，直接开始新一轮
      startSelection();
    }
  };

  // 添加CSS动画样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flash {
        0% { opacity: 0; transform: scale(1.5); color: transparent; text-shadow: 0 0 5px rgba(0,0,0,.5); }
        50% { opacity: 1; }
        100% { opacity: 0; transform: scale(0.5); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 自定义标题，如果未配置则使用默认值
  const appTitle = title || "今天吃什么";

  return (
    <Wrapper>
      <MainArea>
        <BgArea />
        
        <TempContainer ref={tempContainerRef} />
        
        <CenterBox>
          <CenterTitle>
            {status === 'init' && (
              <>
                <b className="what">{appTitle}</b>
              </>
            )}
            {status !== 'init' && (
              <b className="what">{mainMenu}</b>
            )}
          </CenterTitle>
          
          <MainButton onClick={handleBtn}>
            <span>
              {status === 'init' ? '开始' : status === 'running' ? '停止' : '再来一次'}
                  </span>
          </MainButton>
        </CenterBox>
        
        {history.length > 0 && (
          <HistoryContainer>
            {history.map((item, index) => (
              <HistoryItem key={index}>{item}</HistoryItem>
            ))}
          </HistoryContainer>
        )}
      </MainArea>
    </Wrapper>
  );
}

