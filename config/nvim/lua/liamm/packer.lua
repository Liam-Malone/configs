return require('packer').startup(function(use)
  -- Packer can manage itself
  use 'wbthomason/packer.nvim'
  use ({
      'EdenEast/nightfox.nvim',
      config = function()
          vim.cmd('colorscheme carbonfox')
      end
      })
  use 'rust-lang/rust.vim'
  use 'nvim-telescope/telescope.nvim'
  use('nvim-treesitter/nvim-treesitter', {run = ':TSUpdate'})
  use 'nvim-treesitter/playground'
  use 'nvim-lua/plenary.nvim'
  use 'j-hui/fidget.nvim'
  use 'mbbill/undotree'
  use 'theprimeagen/harpoon'
  use 'tpope/vim-fugitive' -- git integration
  
  --LSP CONFIG
  use {
  'VonHeikemen/lsp-zero.nvim',
  branch = 'v2.x',
    requires = {
      -- LSP Support
      {'neovim/nvim-lspconfig'},             -- Required
      {                                      -- Optional
        'williamboman/mason.nvim',
        run = function()
          pcall(vim.cmd, 'MasonUpdate')
        end,
      },
      {'williamboman/mason-lspconfig.nvim'}, -- Optional

      -- Autocompletion
      {'hrsh7th/nvim-cmp'},     -- Required
      {'hrsh7th/cmp-nvim-lsp'}, -- Required
      {'L3MON4D3/LuaSnip'},     -- Required
    }
  }

  use {"akinsho/toggleterm.nvim", tag = '*', config = function()
    require("toggleterm").setup()
  end}
end)
