import React, { useEffect } from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import './LoginAuth0Btn.scss'

export interface Auth0User {
  sub: string
  name: string
  email?: string
}

export interface Auth0SaveData {
  token: string
  refreshToken: string | null
  userId: string
  username: string
  type: 'auth0'
}

export interface LoginAuth0BtnProps {
  // Auth0 hook functions (to be provided by parent)
  loginWithRedirect?: () => void
  isLoading?: boolean
  isAuthenticated?: boolean
  user?: Auth0User | null
  getAccessTokenSilently?: () => Promise<string>
  
  // Callback functions
  onAuthSuccess?: (data: Auth0SaveData) => Promise<void>
  onAccountInfo?: () => Promise<any>
  
  // UI customization
  buttonText?: string
  buttonType?: 'default' | 'primary' | 'dashed' | 'link' | 'text'
  block?: boolean
  size?: 'small' | 'middle' | 'large'
}

/**
 * LoginAuth0Btn Component
 * Auth0 authentication button with automatic token handling
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/LoginAuth0Btn/LoginAuth0Btn.vue
 * 
 * Note: This component expects Auth0 context to be provided by parent.
 * In a real implementation, you would use @auth0/auth0-react provider.
 */
export const LoginAuth0Btn: React.FC<LoginAuth0BtnProps> = ({
  loginWithRedirect,
  isLoading = false,
  isAuthenticated = false,
  user,
  getAccessTokenSilently,
  onAuthSuccess,
  onAccountInfo,
  buttonText = 'Login with Auth0',
  buttonType = 'default',
  block = false,
  size = 'large'
}) => {
  const navigate = useNavigate()

  // Watch for authentication changes
  useEffect(() => {
    const handleAuthentication = async () => {
      if (!isAuthenticated || !user || !getAccessTokenSilently) return

      try {
        const token = await getAccessTokenSilently()
        
        const authData: Auth0SaveData = {
          token,
          refreshToken: null,
          userId: user.sub,
          username: user.name,
          type: 'auth0'
        }

        // Save auth data
        if (onAuthSuccess) {
          await onAuthSuccess(authData)
        }

        // Get account info
        if (onAccountInfo) {
          await onAccountInfo()
        }

        // Navigate to home
        navigate('/')
      } catch (error) {
        console.error('Auth0 authentication failed:', error)
      }
    }

    handleAuthentication()
  }, [isAuthenticated, user, getAccessTokenSilently, onAuthSuccess, onAccountInfo, navigate])

  const handleClick = () => {
    if (loginWithRedirect) {
      loginWithRedirect()
    }
  }

  return (
    <Button
      type={buttonType}
      loading={isLoading}
      onClick={handleClick}
      block={block}
      size={size}
      className="login-auth0-btn"
    >
      {buttonText}
    </Button>
  )
}

