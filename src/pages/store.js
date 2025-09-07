import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './store.module.css';
import { mockPlugins } from '../data/mockPlugins';

const StorePage = () => {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [copiedButtonId, setCopiedButtonId] = useState(null);
  
  // 数据源控制：通过环境变量或配置控制是否使用模拟数据
  // 例如：process.env.USE_MOCK_DATA 或从配置文件中读取
  // 当前默认为false（使用真实API数据）
  const [useMockData, setUseMockData] = useState(false);

  // 复制安装命令到剪贴板
  const copyInstallCommand = (fullName, index) => {
    const command = `yoapi install ${fullName}`;
    navigator.clipboard.writeText(command).then(() => {
      // 设置当前复制的按钮ID
      setCopiedButtonId(index);
      
      // 3秒后恢复按钮状态
      setTimeout(() => {
        setCopiedButtonId(null);
      }, 3000);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        setLoading(true);
        
        if (useMockData) {
          // 使用模拟数据
          setPlugins(mockPlugins);
          setTotalCount(mockPlugins.length);
          setHasNextPage(false);
          setLoading(false);
          return;
        }
        
        // 使用API数据
        const response = await fetch(`https://api.waveyo.store/api/github/plugin_list?page=${currentPage}&per_page=${itemsPerPage}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 使用实际的API数据
        setPlugins(data.items || []);
        setTotalCount(data.total_count || 0);
        setHasNextPage(data.has_next_page || false);
        setLoading(false);
        
      } catch (err) {
        console.error('获取插件列表失败:', err);
        setError('获取元数据失败，请检查网络环境');
        setLoading(false);
      }
    };

    fetchPlugins();
  }, [currentPage, itemsPerPage, useMockData]);

  // 过滤和搜索功能（客户端）
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 分页计算
  const totalPages = Math.ceil(filteredPlugins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlugins = filteredPlugins.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <Layout title="插件商店" description="WaveYo-API插件商店">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>加载中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="插件商店" description="WaveYo-API插件商店">
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="插件商店" description="WaveYo-API插件商店">
      <div className={styles.storeContainer}>
        <header className={styles.header}>
          <h1>插件商店</h1>
          <p>发现和安装WaveYo-API生态系统的优质插件</p>
        </header>

        {/* 搜索区域 */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="搜索插件..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        
        {/* 数据源提示（仅在开发模式下使用模拟数据时显示） */}
        {useMockData && (
          <div style={{
            textAlign: 'center',
            margin: '1rem 0',
            padding: '0.5rem',
            backgroundColor: 'var(--ifm-color-warning-lightest)',
            border: '1px solid var(--ifm-color-warning-light)',
            borderRadius: 'var(--ifm-global-radius)',
            color: 'var(--ifm-color-warning-dark)',
            fontSize: '0.9rem'
          }}>
            🚧 当前使用模拟数据进行测试显示
          </div>
        )}

        {/* 插件列表 */}
        <div className={styles.pluginsGrid}>
          {currentPlugins.map((plugin, index) => (
            <div key={`${plugin.full_name}-${index}`} className={styles.pluginCard}>
              <div className={styles.pluginHeader}>
                <h3 className={styles.pluginName}>{plugin.name}</h3>
                <span className={styles.pluginAuthor}>by {plugin.owner}</span>
              </div>
              <p className={styles.pluginDescription}>{plugin.description}</p>
              
              <div className={styles.pluginMeta}>
                {plugin.language && (
                  <span className={styles.languageTag}>{plugin.language}</span>
                )}
                <a 
                  href={plugin.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.githubLink}
                >
                  GitHub ↗
                </a>
              </div>
              
              <div className={styles.pluginStats}>
                <span title="Stars">⭐ {plugin.stargazers_count}</span>
                <span title="Forks">🍴 {plugin.forks_count}</span>
                <span title="Last updated">🔄 {formatDate(plugin.updated_at)}</span>
              </div>
              
              <button 
                className={copiedButtonId === index ? styles.installButtonCopied : styles.installButton}
                onClick={() => copyInstallCommand(plugin.full_name, index)}
                title={`复制安装命令: yoapi install ${plugin.full_name}`}
              >
                {copiedButtonId === index ? '成功复制安装命令' : '复制安装命令'}
              </button>
            </div>
          ))}
        </div>

        {/* 搜索结果统计 */}
        {searchTerm && (
          <div className={styles.searchStats}>
            找到 {filteredPlugins.length} 个匹配的插件
          </div>
        )}

        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StorePage;
